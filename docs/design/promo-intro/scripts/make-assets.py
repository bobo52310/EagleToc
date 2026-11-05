#!/usr/bin/env python3
"""Derived assets for the composition. Crops and colour only; capture files stay untouched.

- assets/sky-night.jpg: night sky plate from the cloud bands of eagle-soar.png (above/below the bird)
- assets/crops/*: real screenshots split so article and panel can move independently, plus S4 cards
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
CAP = ASSETS / "capture"
CROPS = ASSETS / "crops"
CROPS.mkdir(exist_ok=True)


def smooth(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def build_sky():
    W, H, HORIZON = 1920, 1080, 350
    src = Image.open(ASSETS / "eagle-soar.png").convert("RGB")
    ys = np.arange(H, dtype=np.float32)

    top = np.array([7, 13, 43], dtype=np.float32)
    mid = np.array([20, 42, 112], dtype=np.float32)
    low = np.array([7, 13, 43], dtype=np.float32)
    up = smooth(ys / HORIZON) ** 1.8
    dn = smooth((ys - HORIZON) / (H - HORIZON))
    base = np.where(
        (ys < HORIZON)[:, None],
        top[None, :] * (1 - up[:, None]) + mid[None, :] * up[:, None],
        mid[None, :] * (1 - dn[:, None]) + low[None, :] * dn[:, None],
    )
    img = np.repeat(base[:, None, :], W, axis=1).astype(np.float32)

    def strip(box, size, flip=False):
        s = src.crop(box)
        if flip:
            s = s.transpose(Image.FLIP_LEFT_RIGHT)
        return np.array(s.resize(size, Image.LANCZOS)).astype(np.float32)

    def screen(layer, x_mask=None):
        nonlocal img
        layer = np.clip(layer, 0, 255)
        img = 255 - (255 - img) * (255 - layer) / 255

    # Cloud deck seen from above: the cloud band is projected as a ground plane, so it
    # flattens into the horizon instead of hanging like a curtain.
    tex = np.array(src.crop((0, 804, 1792, 1024))).astype(np.float32)
    tex_h, tex_w = tex.shape[:2]

    def sample(ax, ay):
        u = np.abs(((ax + tex_w) % (2 * tex_w)) - tex_w)
        v = np.abs(((ay + tex_h) % (2 * tex_h)) - tex_h)
        u = np.clip(u, 0, tex_w - 1)
        v = np.clip(v, 0, tex_h - 1)
        return np.dstack([map_coordinates(tex[..., c], [v, u], order=1) for c in range(3)])

    deck = np.zeros((H, W, 3), dtype=np.float32)
    xs = (np.arange(W, dtype=np.float32) - 960)[None, :]
    SS = 5
    for j in range(SS):  # supersample depth so the far band does not alias
        rows = np.arange(H, dtype=np.float32)[:, None] + j / SS
        depth = 1 / np.maximum(rows - HORIZON + 3, 3)
        ax, ay = np.broadcast_arrays(xs * depth * 430 + 300, depth * 170000 + 40)
        deck += sample(ax, ay) / SS
    depth_y = np.clip((ys - HORIZON) / (H - HORIZON), 0, 1)
    gain = smooth((ys - HORIZON) / 90) * (1.05 + 2.1 * (1 - depth_y) ** 2) * (1 - smooth((depth_y - 0.42) / 0.58) * 0.86)
    screen(gaussian_filter(deck, sigma=(0.6, 1.4, 0)) * gain[:, None, None])

    # Faint high wisps, kept quiet: copy sits over this band.
    high_h = 210
    t = np.linspace(0, 1, high_h)
    high_gain = smooth(t / 0.45) * (1 - smooth((t - 0.6) / 0.4)) * 0.55
    wisps = np.zeros((H, W, 3), dtype=np.float32)
    wisps[120 : 120 + high_h] = strip((0, 0, 1792, 204), (W, high_h), flip=True) * high_gain[:, None, None]
    screen(wisps)

    # Stars above the horizon, seeded so every build matches.
    rng = np.random.default_rng(52310)
    for _ in range(170):
        x, y = rng.integers(0, W), rng.integers(0, HORIZON - 20)
        a = rng.uniform(0.18, 0.75) * (1 - y / HORIZON) ** 0.5
        c = np.array([214, 230, 255], dtype=np.float32)
        img[y, x] = img[y, x] * (1 - a) + c * a
        if rng.uniform() < 0.16 and 0 < x < W - 1 and 0 < y:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                img[y + dy, x + dx] = img[y + dy, x + dx] * (1 - a * 0.4) + c * a * 0.4

    Image.fromarray(img.clip(0, 255).astype(np.uint8)).save(ASSETS / "sky-night.jpg", quality=90)


def crop(name, box_css, out, width=None, **save):
    """box_css is CSS px in the 1920x1080 viewport; captures are 2x."""
    x0, y0, x1, y1 = [v * 2 for v in box_css]
    im = Image.open(CAP / name).convert("RGB").crop((x0, y0, x1, y1))
    if width:
        im = im.resize((width, round(width * im.height / im.width)), Image.LANCZOS)
    im.save(CROPS / out, **save)


def build_crops():
    SPLIT = 1540  # right of the article column, left of the panel
    for view, tag in (("view-prejump.png", "pre"), ("view-jump.png", "jump")):
        crop(view, (0, 0, SPLIT, 1080), f"{tag}-article.png")
        crop(view, (SPLIT, 0, 1920, 1080), f"{tag}-panel.png")

    # S4 cards (English pages). Top edges sit in the gap between content blocks; MDN and GitHub also clear the
    # panel rows that are not article headings (MDN: ad strip, squeezed toolbar, "In this article";
    # GitHub: "Repository navigation" ... "File metadata and controls"). The blog card starts above the feedback
    # banner so the site tag does not cover the post title. Panel content is never retouched.
    crop("site-mdn.png", (560, 356, 1920, 1080), "card-mdn.jpg", width=2040, quality=90)
    crop("site-github.png", (596, 512, 1920, 1080), "card-github.jpg", width=2040, quality=90)
    crop("site-blog.png", (530, 92, 1920, 812), "card-blog.jpg", width=2040, quality=90)
    crop("view-dark.png", (470, 90, 1920, 900), "card-dark.jpg", width=2040, quality=90)

if __name__ == "__main__":
    import sys
    if "--crops-only" not in sys.argv:  # the English cut reuses sky-night.jpg from the zh-TW build as-is
        build_sky()
    build_crops()
    print("sky and crops written")
