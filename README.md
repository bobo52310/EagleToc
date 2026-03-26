# EagleToc — Smart Table of Contents

> Navigate with eagle-eye precision.

A Chrome extension that auto-generates a smart table of contents for any website — helping you navigate long articles, technical docs, and online books with ease.

**[繁體中文](#繁體中文)**

---

## Features

**Smart Detection** — Automatically identifies page structure and heading hierarchy, no manual setup needed

**Precise Navigation** — Bird's-eye view of the full article structure with real-time reading position tracking

**Floating Panel** — Draggable, resizable, dockable panel that stays out of your way

**Multiple Themes** — Light, dark, plus ocean, forest, sunset, and galaxy themes

**Zen Mode** — Immersive distraction-free reading experience

**Wildcard Whitelist** — Supports patterns like `*.github.*` for flexible domain matching

**Quick Search** — Instant heading search with keyboard navigation

**Multi-format Export** — Copy as plain text or Markdown for note-taking

---

## Use Cases

| Scenario | Benefit |
| --- | --- |
| Technical docs | Quickly locate API references |
| Long-form articles | Grasp structure, jump between sections |
| Research & study | Organize knowledge, improve comprehension |
| Content creation | Analyze competitor structure |

---

## Getting Started

### Installation

**Chrome Web Store** — Coming soon

**Manual install (developer mode):**

```bash
git clone https://github.com/bobo52310/EagleToc.git
```

1. Go to `chrome://extensions/` and enable "Developer mode"
2. Click "Load unpacked" and select the downloaded folder
3. EagleToc will appear in your extensions list

### Usage

1. Click the extension icon in the toolbar to open the TOC
2. Click any heading to jump to that section
3. Press `Escape` or click × to close the panel
4. Drag the bottom-right corner to resize; drag the title bar to reposition

### Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Escape` | Close TOC panel |
| `Alt/Option` + hover | Quick preview mode |

---

## Settings

Accessible via the extension icon → settings button:

- Enable local HTML file support
- Auto-display TOC on compatible pages
- Max heading depth (3–6 levels)
- Panel position and width
- Auto-show whitelist and hidden site list (supports wildcards)
- Floating mode with draggable position memory (with "reset position")

---

## Themes

### Built-in Themes

| Theme | Description |
| --- | --- |
| Light | Clean and minimal, ideal for daytime |
| Dark | Eye-friendly, ideal for night use |
| Ocean | Blue tones, calm atmosphere |
| Forest | Green tones, natural and fresh |
| Sunset | Warm tones, cozy feel |
| Galaxy | Vibrant colors, futuristic vibe |

### Zen Mode

- Full-screen immersive reading with blurred background
- Three scroll speed settings: slow, medium, fast
- Reading progress tracking
- Customizable font size, line height, and blur intensity

---

## Supported Websites

Works with any site using standard HTML heading tags (h1–h6):

- Encyclopedias — Wikipedia
- Technical docs — GitHub, MDN, API references
- Blogs — Medium, dev blogs
- Online books — GitBook, e-book platforms
- Enterprise docs — internal wikis, help centers
- News — long-form reports, in-depth analysis

---

## v1.1.0 Highlights

- **Wildcard domain matching** — Flexible patterns like `*.github.*`
- **Redesigned search** — Search panel adjacent to TOC, no longer full-screen
- **Instant tooltips** — Custom tooltip system with dark theme support
- **Smart panel collapse** — Auto-collapses when using other features
- **Dark theme detection** — Respects system theme preference

---

## Technical

### Core

- Smart algorithm for automatic structure and heading detection
- Performance-optimized: runs only when needed
- Cross-site compatible: works on any site with standard HTML headings
- Responsive design: adapts to different screen sizes

### Privacy

- All processing is local — no data is sent anywhere
- Minimal permissions required
- No user behavior tracking

---

## Development

### Project Structure

```text
eagle-toc/
├── manifest.json          # Extension manifest
├── popup/                 # Popup window
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/               # Content scripts
│   ├── content.js         # Main logic
│   └── content.css        # Styles
├── background/            # Background scripts
│   └── background.js
├── options/               # Settings page
│   ├── options.html
│   ├── options.css
│   └── options.js
└── icons/                 # Icon assets
```

### Testing

1. Load the unpacked extension in developer mode
2. Visit a page with headings (e.g. a Wikipedia article)
3. Click the extension icon to open the TOC
4. Test compatibility across different sites

---

## Contributing

Contributions are welcome!

1. Fork this repository
2. Create a feature branch — `git checkout -b feature/amazing-feature`
3. Commit your changes — `git commit -m 'Add amazing feature'`
4. Push to the branch — `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

MIT — See [LICENSE](./LICENSE) for details.

## Links

- Report issues — [GitHub Issues](https://github.com/bobo52310/EagleToc/issues)
- Feature requests — [GitHub Discussions](https://github.com/bobo52310/EagleToc/discussions)
- Contact — [bobo52310@gmail.com](mailto:bobo52310@gmail.com)
- [Feature Documentation](./FEATURE_DOCUMENTATION.md) | [API Reference](./API_REFERENCE.md)

---

If this project helps you, please consider giving it a star.

---

## 繁體中文

> 鷹眼俯瞰，精準導航

一款專為提升網頁閱讀體驗而設計的 Chrome 擴充功能。自動為任何網站生成智慧目錄，讓你以鷹眼視角俯瞰全文結構，精準導航長篇文章、技術文件和線上書籍。

### 核心特色

**智慧偵測** — 自動識別頁面結構和標題層級，無需手動設定

**精準導航** — 俯瞰全文架構，定位當前閱讀位置，一鍵跳轉任意段落

**浮動面板** — 可拖拉、縮放、停靠的智慧面板，不干擾閱讀體驗

**多主題切換** — 亮色、暗色，以及海洋、森林等個性化主題

**禪讀模式** — 沈浸式閱讀體驗，消除干擾，專注內容

**智慧白名單** — 支援 `*.github.*` 等彈性網域設定，自動啟動

**快速搜尋** — 即時搜尋標題內容，快速跳轉至目標段落

**多格式匯出** — 支援純文字、Markdown 格式複製，便於筆記整理

### 安裝方式

**Chrome 擴充商店** — 即將推出

**手動安裝（開發者模式）：**

```bash
git clone https://github.com/bobo52310/EagleToc.git
```

1. 前往 `chrome://extensions/`，開啟右上角「開發人員模式」
2. 點選「載入未封裝項目」，選擇下載的資料夾
3. EagleToc 將出現在擴充功能清單中

### 使用方式

1. 點選工具列的擴充功能圖示，開啟目錄
2. 點選任意標題即可跳轉至對應段落
3. 點選 × 或按 `Escape` 關閉面板
4. 拖拉右下角調整面板尺寸，拖拉標題列移動位置

### 個人化設定

透過擴充功能圖示 → 設定按鈕存取：

- 啟用本機 HTML 檔案支援
- 相容頁面自動顯示目錄
- 最大標題層級設定（3–6 層）
- 目錄位置和寬度調整
- 自動顯示白名單與隱藏站點清單（支援萬用字元）
- 浮動模式可拖曳面板位置並自動記憶（提供「重設位置」）

### 主題與禪讀模式

內建亮色、暗色、海洋、森林、夕陽、銀河六種主題。禪讀模式提供全螢幕沈浸式閱讀，支援三檔滾動速度、閱讀進度追蹤，以及字體大小、行距、模糊程度自訂。

### 支援網站

完美支援使用標準 HTML 標題標籤（h1–h6）的網站，包括百科、技術文檔、部落格、線上書籍、企業文檔與新聞媒體。

### 隱私保護

所有功能在本機執行，不傳送資料。僅要求必要的瀏覽權限，不收集使用者行為資料。

### 聯絡

- 回報問題 — [GitHub Issues](https://github.com/bobo52310/EagleToc/issues)
- 功能建議 — [GitHub Discussions](https://github.com/bobo52310/EagleToc/discussions)
- 聯絡開發者 — [bobo52310@gmail.com](mailto:bobo52310@gmail.com)
