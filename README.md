# Smart TOC - Chrome Extension

A Chrome extension that displays a table of contents for any website, making it easier to read and navigate long articles, documentations, and online books.

## Features

- 🔍 Auto detects article and headings with smart algorithm
- 🎯 Highlights current heading
- 🖱️ Click to jump to heading
- 📖 Expand/fold headings, or to specified level
- 🎪 Floating panel - drag, resize, or dock to side
- 👀 Mouse hover while holding Alt/Option key to glance
- 📋 Copy to clipboard (txt, markdown)
- 🎨 Clean user interface
- ⚡ Only runs when you use it
- 🌐 Works on any website with proper HTML headings

## Installation

### From Chrome Web Store
*Coming soon*

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The Smart TOC extension should now appear in your extensions list

## Usage

1. **Toggle TOC**: Click the extension icon in the toolbar
2. **Navigate**: Click on any heading in the TOC to jump to that section
3. **Close**: Click the × button or press Escape
4. **Resize**: Drag the bottom-right corner of the TOC panel
5. **Move**: Drag the header to reposition the panel

## Keyboard Shortcuts

- **Alt/Option + T**: Toggle TOC (coming soon)
- **Escape**: Close TOC

## Settings

Access settings by clicking the extension icon → Settings button.

- Enable for local HTML files
- Auto-show TOC on compatible pages
- Maximum heading levels (3-6)
- TOC position and width

## Supported Websites

Any website that uses proper HTML heading tags (h1-h6):
- Wikipedia
- Documentation sites
- Blog articles  
- Online books
- GitHub repositories
- And many more!

## Development

### File Structure
```
smart-toc/
├── manifest.json          # Extension manifest
├── popup/                 # Extension popup
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/              # Content scripts
│   ├── content.js
│   └── content.css
├── background/           # Background script
│   └── background.js
├── options/             # Settings page
│   ├── options.html
│   ├── options.css
│   └── options.js
└── icons/               # Extension icons
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

### Testing
1. Load the extension in developer mode
2. Visit any page with headings (e.g., Wikipedia article)
3. Click the extension icon to toggle TOC
4. Test on various websites to ensure compatibility

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Changelog

### v1.1.0 (Latest)
- 🌟 **Wildcard whitelist support**: Use `*` patterns like `*.github.*` for flexible domain matching
- 🔍 **Redesigned search UI**: Search panel appears next to TOC instead of center-screen
- ⚡ **Instant tooltips**: Custom tooltips with immediate response and dark theme support
- 🎛️ **Smart settings panel**: Auto-closes when using other features for better workflow
- 🌙 **Dark theme support**: Full dark mode with automatic system preference detection
- 📄 **Enhanced documentation**: Comprehensive feature guide and testing framework

### v1.0.0
- Initial release
- Basic TOC generation and navigation
- Floating panel with drag/resize
- Settings page
- Support for h1-h6 headings

## 📖 Enhanced Features Documentation

For detailed information about the new features, see [FEATURE_DOCUMENTATION.md](./FEATURE_DOCUMENTATION.md)