# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EagleToc is a Chrome Extension (Manifest V3) that generates a floating table of contents for any webpage. The extension auto-detects article content and headings, providing navigation, search, and a "Zen Mode" reading experience.

## Architecture

### Chrome Extension Structure
```
├── manifest.json          # MV3 manifest, default_locale: zh_TW
├── content/               # Content scripts injected into web pages
│   ├── content.js         # Main EagleTOC class (~3000 lines)
│   └── content.css        # Panel styling with dark theme support
├── background/
│   └── background.js      # Service worker for storage management
├── options/               # Popup/settings UI
│   ├── options.html
│   ├── options.js
│   └── options.css
├── _locales/              # i18n (zh_TW, en)
└── icons/                 # Extension icons
```

### Core Class: `EagleTOC` (content/content.js)

Single-class architecture handling all functionality:

- **Heading extraction**: Finds h1-h6 and `<strong>` tags, filters navigation/footer noise
- **TOC panel**: Floating, draggable, resizable panel with collapse/expand
- **Scroll sync**: IntersectionObserver tracks current heading position
- **Search**: Fuzzy search modal with keyboard navigation
- **Zen Mode**: Full-screen reading experience with multiple themes (classic, starry, ocean, forest, sunset, galaxy)
- **Theming**: Auto/light/dark themes via CSS `prefers-color-scheme`
- **Whitelist**: Wildcard pattern matching (`*.github.*`, `docs.*.org`)
- **Glance mode**: Hold Alt/Option + hover to preview TOC

### Settings Storage

Uses Chrome Storage Sync API with 8KB per-item limit:
- Settings and whitelist stored separately to avoid limits
- Background script handles `get-settings`, `save-settings`, `save-whitelist` messages

### Landing Page (website/)

Astro-based static site with TailwindCSS v4:
```
website/
├── src/
│   ├── pages/index.astro
│   ├── layouts/Layout.astro
│   ├── components/
│   └── styles/global.css
└── package.json
```

## Development Commands

### Chrome Extension
```bash
# No build step - load unpacked extension directly in Chrome
# chrome://extensions > Load unpacked > select project root
```

### Landing Page (website/)
```bash
cd website
npm install
npm run dev      # Dev server at localhost:4321
npm run build    # Build to ./dist/
npm run preview  # Preview production build
```

## Key Implementation Details

### Wildcard Whitelist Matching
```javascript
// Pattern: *.github.* matches api.github.com, docs.github.io
// Uses regex: asterisks become .* with proper escaping
isInWhitelist(domain) {
  // Supports: *.example.com, test.*, *.github.*, docs.*.org
}
```

### Scroll Tracking
Uses IntersectionObserver with threshold array for smooth current-heading detection. Handles edge cases like headings in collapsed sections.

### Theme System
Three themes (auto/light/dark) with CSS custom properties. Auto mode respects system `prefers-color-scheme`. Zen Mode has 6 additional reading themes.

### Search Positioning
Search dialog positions adjacent to TOC panel (not center-modal) for non-intrusive UX.

## Testing

- Manual testing via `test-auto-show.js`, `test-deduplication.js`, `debug-auto-show.js`
- Use `feature-test.html` for comprehensive feature testing
- Dark theme: Toggle system dark mode or use `document.documentElement.style.colorScheme = 'dark'`

## i18n

Default locale is `zh_TW`. Message files in `_locales/{locale}/messages.json`. All UI text uses `chrome.i18n.getMessage()`.
