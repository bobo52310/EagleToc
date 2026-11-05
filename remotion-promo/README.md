# EagleToc Promotional Video

A professional promotional video for EagleToc Chrome Extension, built with Remotion and React.

## 🎬 Video Structure

**Duration:** 24 seconds (576 frames @ 24fps)

### Timeline

```
┌─────────────────────────────────────────────────────────────┐
│ Scene 1 │ Scene 2      │ Scene 3  │ Scene 4               │
│  5s     │   7s         │   5s     │   7s                  │
│ Pain    │ Solution     │ Feature  │ CTA                   │
│         │   ↑fade      │   ↑fade  │                       │
└─────────────────────────────────────────────────────────────┘
          0:05          0:12       0:17                   0:24
```

### Scenes

1. **Scene 1: Pain Point** (5s)
   - Message: "Lost in endless scrolling?"
   - Creates empathy with viewers struggling with long articles
   - Fade-in animation

2. **Scene 2: Solution** (7s)
   - Message: "EagleToc - 鷹眼智慧目錄"
   - Brand introduction with spring animation
   - Eagle eye metaphor for overview perspective

3. **Scene 3: Feature** (5s)
   - Message: "Type. Filter. Found."
   - Emphasizes speed and simplicity
   - Search functionality demo

4. **Scene 4: CTA** (7s)
   - Phase 1 (0-3s): "See Everything. Miss Nothing."
   - Phase 2 (3-7s): Icon + "EagleToc" + "Free Chrome Extension"
   - Spring-animated icon with pulsing glow

### Transitions

- Scene 1 → 2: **Hard cut** (emphasizes contrast)
- Scene 2 → 3: **Fade dissolve** (0.5s)
- Scene 3 → 4: **Fade dissolve** (0.5s)

## 📱 Multi-Format Support

The video supports three formats optimized for different platforms:

| Format | Aspect Ratio | Dimensions | Platforms |
|--------|-------------|-----------|-----------|
| **Full** | 16:9 | 1920x1080 | YouTube, Website |
| **Square** | 1:1 | 1080x1080 | Instagram Posts, LinkedIn |
| **Vertical** | 9:16 | 1080x1920 | TikTok, Reels, YouTube Shorts |

All formats use responsive font sizes and element scaling for optimal visibility.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Assets in `public/` folder:
  - `scene1.mp4` - Pain point visual
  - `scene2.mp4` - Eagle eye perspective
  - `scene3.mp4` - Search demo (optional, ~4.58s)
  - `scene4.mp4` - Overview perspective
  - `icon128.png` - EagleToc icon

> The scene videos are not committed (they are large binaries). Provide your own clips with these names before rendering.

### Development

```bash
# Install dependencies
npm install

# Launch Remotion Studio (interactive preview)
npm run studio
```

Open http://localhost:3000 to see the preview with timeline controls.

### Rendering

```bash
# Render full HD video (YouTube, Website)
npm run render

# Render square format (Instagram, LinkedIn)
npm run render:square

# Render vertical format (TikTok, Reels, Shorts)
npm run render:vertical

# Render low-quality preview (faster)
npm run render:preview

# Render animated GIF
npm run render:gif
```

Output files are saved to `out/` directory (gitignored).

## 🛠️ Project Structure

```
remotion-promo/
├── src/
│   ├── Root.tsx                    # Composition definitions (3 formats)
│   ├── EagleTocPromo.tsx           # Main video composition
│   ├── index.ts                    # Entry point
│   └── components/
│       ├── Scene1Pain.tsx          # Pain point scene
│       ├── Scene2Solution.tsx      # Solution introduction
│       ├── Scene3Search.tsx        # Feature highlight
│       ├── Scene4CTA.tsx           # Call to action
│       ├── TextOverlay.tsx         # Reusable text component
│       └── Watermark.tsx           # Logo watermark
├── public/                         # Video assets and images
├── out/                            # Rendered output
├── package.json
├── remotion.config.ts              # Remotion configuration
└── tsconfig.json
```

## 🎨 Key Features

### Animation Techniques

- **Spring animations**: Physics-based bouncy entrance (Scene 2, Scene 4 icon)
- **Interpolation**: Smooth opacity and position transitions
- **Pulsing glow**: Subtle animated glow on CTA icon
- **Responsive sizing**: Automatic font/element scaling per format

### Best Practices Applied

✅ **TransitionSeries** for smooth scene transitions
✅ **AbsoluteFill** for proper layering
✅ **staticFile()** for asset loading
✅ **useCurrentFrame()** for frame-based animations
✅ **spring()** for natural physics-based motion
✅ **interpolate()** for smooth value mapping
✅ **Multi-format compositions** for platform optimization
✅ **Type safety** with TypeScript and shared props interfaces

## 📖 Remotion Resources

- **Official Docs**: https://www.remotion.dev/docs/
- **API Reference**: https://www.remotion.dev/docs/api
- **Examples**: https://www.remotion.dev/docs/examples

## 🔧 Configuration

### Frame Rate

Default: 24 fps (matches source videos)

### Video Settings

Configured in `remotion.config.ts`:
- Image format: JPEG (faster rendering)
- Overwrite output: Enabled

### TypeScript

Configured in `tsconfig.json`:
- Target: ES2022
- Module resolution: bundler
- JSX: react-jsx
- Strict mode enabled

## 📝 Customization

### Adjust Scene Durations

Edit `src/EagleTocPromo.tsx`:

```typescript
const scene1Duration = 5 * fps;  // Change to desired seconds
const scene2Duration = 7 * fps;
const scene3Duration = 5 * fps;
const scene4Duration = 7 * fps;
```

### Modify Text Content

Edit individual scene components:
- `Scene1Pain.tsx` - Pain point message
- `Scene2Solution.tsx` - Brand name and subtitle
- `Scene3Search.tsx` - Feature tagline
- `Scene4CTA.tsx` - CTA text

### Customize Animations

All animations use `interpolate()` and `spring()`:

```typescript
// Fade animation example
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: "clamp",
});

// Spring animation example
const scale = spring({
  frame,
  fps,
  config: { damping: 10, stiffness: 100 },
});
```

## 🎯 Rendering Tips

1. **Preview first**: Use `npm run studio` to preview changes before rendering
2. **Quick drafts**: Use `npm run render:preview` for faster low-quality previews
3. **Format selection**: Choose the right format for your target platform
4. **Asset optimization**: Compress source videos before adding to `public/`

## 📦 Dependencies

- `remotion` - Video framework
- `@remotion/cli` - Command-line tools
- `@remotion/media` - Video/Audio components
- `@remotion/transitions` - Scene transition effects
- `react` & `react-dom` - UI framework
- `typescript` - Type safety

## 🔄 Upgrading

```bash
# Update all Remotion packages to latest version
npm run upgrade

# Check current versions
npm run versions
```

## 📄 License

Part of the EagleToc project.
