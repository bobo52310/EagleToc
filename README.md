# EagleToc — Smart Table of Contents

**English** · [繁體中文](README.zh-TW.md)

> Navigate with eagle-eye precision.

A Chrome extension that generates a floating table of contents for any webpage, so you can see the whole structure of long articles, technical docs and online books at a glance and jump straight to the part you want.

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Install-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/eagletoc-eagle-eye-table/ibempgkkjjokbaojofkfcbpbeieglbic)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)](manifest.json)
[![Version](https://img.shields.io/badge/version-1.0.1-informational)](manifest.json)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Project site: [eagletoc.bobochen.dev](https://eagletoc.bobochen.dev/)

---

## Intro animation

![EagleToc, a 33-second intro](docs/promo/intro-en.gif)

> It's not that the article is too long — you're standing too low. EagleToc lifts you to eagle height: see the whole outline at once, click to jump to any section, and find a heading by remembering a single word.

[MP4 (EN)](docs/promo/intro-en.mp4) · [MP4 (zh-TW)](docs/promo/intro-zh-tw.mp4) · [GIF (zh-TW)](docs/promo/intro-zh-tw.gif)

Every frame shows the real extension. The animation sources (HyperFrames compositions) are in [`docs/design/promo-intro/`](docs/design/promo-intro/) and [`docs/design/promo-intro-zh-tw/`](docs/design/promo-intro-zh-tw/).

---

## Features

- **Smart detection** — finds the page's headings and hierarchy automatically and filters out navigation and footer noise. No setup.
- **Precise navigation** — a bird's-eye view of the article that highlights where you are as you read; click any heading to jump there.
- **Floating panel** — drag, resize and collapse it; the position is remembered.
- **Quick search** — a search box next to the panel with fuzzy heading matching and keyboard navigation.
- **Glance mode** — hold `Alt/Option` and hover to preview the TOC.
- **Zen Mode** — distraction-free full-screen reading with six reading themes and three auto-scroll speeds.
- **Auto / light / dark themes** — auto follows the system `prefers-color-scheme`.
- **Wildcard whitelist** — patterns like `*.github.*` or `docs.*.org` show the TOC automatically.
- **Copy the outline** — as plain text or Markdown, for your notes.

---

## Getting started

### Install

**[Chrome Web Store](https://chromewebstore.google.com/detail/eagletoc-eagle-eye-table/ibempgkkjjokbaojofkfcbpbeieglbic)** — one-click install (recommended).

**Manual install (developer mode):**

```bash
git clone https://github.com/bobo52310/EagleToc.git
```

1. Open `chrome://extensions/` and turn on **Developer mode**.
2. Click **Load unpacked** and select the cloned folder.
3. EagleToc appears in your extensions list.

### Usage

1. Click the extension icon in the toolbar to open the TOC.
2. Click any heading to jump to that section.
3. Press `Escape` or click × to close the panel.
4. Drag the bottom-right corner to resize; drag the title bar to move it.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Alt/Option` + `T` | Toggle the TOC panel |
| `Alt/Option` + `S` | Search headings (while the TOC is visible) |
| `Alt/Option` + hover | Glance preview |
| `Escape` | Close the panel / search |

---

## Settings

Open them from the extension icon:

- Enable support for local HTML files
- Auto-show the TOC on compatible pages
- Maximum heading depth (3–6 levels)
- Panel position and width
- Auto-show whitelist and hidden-site list (wildcards supported)
- Floating mode with a remembered, draggable position (and a "reset position" button)

Settings sync through Chrome Storage Sync. Settings and the whitelist are stored separately to stay under the 8 KB per-item limit.

---

## Themes

| Kind | Options |
| --- | --- |
| Panel theme | Auto (follows the system), light, dark |
| Zen Mode theme | Classic, starry, ocean, forest, sunset, galaxy |

Zen Mode also lets you adjust font size, line spacing, background blur and auto-scroll speed (slow / medium / fast), and tracks your reading progress.

---

## Supported sites

Any site that uses standard HTML heading tags (h1–h6), for example:

- Encyclopedias — Wikipedia
- Technical docs — GitHub, MDN, API references
- Blogs — Medium, developer blogs
- Online books — GitBook, e-book platforms
- Company docs — internal wikis, help centers

---

## Privacy

- Everything runs in your browser. Page content is never sent anywhere.
- No usage tracking.
- See [PRIVACY.md](PRIVACY.md).

---

## Development

There is no build step. Load the repository root with **Load unpacked**.

```text
EagleToc/
├── manifest.json          # MV3 manifest, default_locale: zh_TW
├── content/               # Content script (the EagleTOC class) and styles
├── background/            # Service worker for settings storage
├── options/               # Toolbar popup / settings page
├── _locales/              # i18n (zh_TW, en)
├── icons/                 # Extension icons
├── screenshots/           # Chrome Web Store screenshots
├── tools/                 # Store screenshot capture script
└── docs/
    ├── promo/             # Intro animation renders (GIF, MP4)
    └── design/            # Intro animation sources (HyperFrames)
```

### Testing

1. Load the unpacked extension in developer mode.
2. Visit a page with headings (a Wikipedia article works well).
3. Click the extension icon to open the TOC.
4. Dark theme: switch the system to dark mode, or run `document.documentElement.style.colorScheme = 'dark'` in the console.

---

## Contributing

Contributions are welcome.

1. Fork this repository
2. Create a feature branch — `git checkout -b feature/amazing-feature`
3. Commit your changes — `git commit -m 'Add amazing feature'`
4. Push the branch — `git push origin feature/amazing-feature`
5. Open a pull request

Report bugs in [GitHub Issues](https://github.com/bobo52310/EagleToc/issues).

---

## License

MIT — see [LICENSE](LICENSE).

---

Made by [Bobo Chen](https://bobochen.dev) · If EagleToc helps you, a star is appreciated ⭐
