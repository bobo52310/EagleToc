# EagleToc — 智慧網頁目錄

[English](README.md) · **繁體中文**

> 鷹眼俯瞰，精準導航

一款 Chrome 擴充功能，自動為任何網頁生成浮動目錄，讓你以鷹眼視角俯瞰全文結構，精準導航長篇文章、技術文件和線上書籍。

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-安裝-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/eagletoc-eagle-eye-table/ibempgkkjjokbaojofkfcbpbeieglbic)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)](manifest.json)
[![Version](https://img.shields.io/badge/version-1.0.1-informational)](manifest.json)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

專案網站：[eagletoc.bobochen.dev](https://eagletoc.bobochen.dev/)

---

## 🎬 簡介動畫

![EagleToc · 33 秒看懂](docs/promo/intro-zh-tw.gif)

> **不是文章太長，是你站得太低。** EagleToc 把你帶到鷹的高度：整篇文章的結構一眼看完，點一下就跳到想讀的段落，記得一個詞就找得到。

**[🎞️ English version](docs/promo/intro-en.gif)** · [下載 MP4 (zh-TW)](docs/promo/intro-zh-tw.mp4) · [Download MP4 (EN)](docs/promo/intro-en.mp4)

> 動畫畫面全部取自真實的擴充功能。原始檔（HyperFrames composition）：[`docs/design/promo-intro/`](docs/design/promo-intro/) · [`docs/design/promo-intro-zh-tw/`](docs/design/promo-intro-zh-tw/)

---

## ✨ 核心特色

- **智慧偵測** — 自動識別頁面結構和標題層級，過濾導覽列與頁尾雜訊，無需手動設定
- **精準導航** — 俯瞰全文架構，即時標示目前閱讀位置，一鍵跳轉任意段落
- **浮動面板** — 可拖拉、縮放、收合的面板，位置會自動記憶
- **快速搜尋** — 搜尋框緊鄰目錄面板，模糊比對標題，支援鍵盤操作
- **快速預覽** — 按住 `Alt/Option` 並懸停即可預覽目錄
- **禪讀模式** — 全螢幕沉浸式閱讀，六種閱讀主題、三檔自動捲動速度
- **七種面板主題** — 自動、亮色、暗色、海洋、森林、夕陽、珊瑚；自動模式跟隨系統 `prefers-color-scheme`
- **智慧白名單** — 支援 `*.github.*`、`docs.*.org` 等萬用字元網域，自動顯示目錄
- **多格式複製** — 目錄可複製為純文字或 Markdown，方便整理筆記

---

## 🚀 快速開始

### 安裝方式

**[Chrome 線上應用程式商店](https://chromewebstore.google.com/detail/eagletoc-eagle-eye-table/ibempgkkjjokbaojofkfcbpbeieglbic)** — 一鍵安裝，推薦方式

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

### 鍵盤快捷鍵

| 按鍵 | 功能 |
| --- | --- |
| `Alt/Option` + `T` | 開關目錄面板 |
| `Alt/Option` + `S` | 搜尋標題（目錄顯示時） |
| `Alt/Option` + 懸停 | 快速預覽 |
| `Escape` | 關閉目錄面板／搜尋 |

---

## ⚙️ 個人化設定

透過擴充功能圖示開啟設定：

- 啟用本機 HTML 檔案支援
- 相容頁面自動顯示目錄
- 最大標題層級（3–6 層）
- 目錄位置和寬度
- 自動顯示白名單與隱藏站點清單（支援萬用字元）
- 浮動模式可拖曳面板並記憶位置（提供「重設位置」）

設定透過 Chrome Storage Sync 同步，設定值與白名單分開儲存，避開單筆 8KB 的上限。

---

## 🎨 主題

| 類型 | 選項 |
| --- | --- |
| 面板主題 | 自動（跟隨系統）、亮色、暗色、海洋、森林、夕陽、珊瑚 |
| 禪讀主題 | 經典、星空、海洋、森林、夕陽、銀河 |

禪讀模式另可調整字體大小、行距、背景模糊程度與自動捲動速度（慢／中／快），並追蹤閱讀進度。

---

## 🌐 支援網站

支援任何使用標準 HTML 標題標籤（h1–h6）的網站，例如：

- 百科 — Wikipedia
- 技術文件 — GitHub、MDN、API 參考
- 部落格 — Medium、技術部落格
- 線上書籍 — GitBook、電子書平台
- 企業文件 — 內部 Wiki、幫助中心

---

## 🔒 隱私

- 所有功能都在你的瀏覽器裡執行，不傳送任何頁面內容
- 不收集使用者行為資料
- 詳見 [PRIVACY.md](PRIVACY.md)

---

## 🛠️ 開發

沒有 build 步驟，直接以「載入未封裝項目」載入專案根目錄即可。

```text
EagleToc/
├── manifest.json          # MV3 清單，default_locale: zh_TW
├── content/               # 內容腳本（EagleTOC 主類別與樣式）
├── background/            # Service worker，負責設定儲存
├── options/               # 工具列彈窗／設定頁面
├── _locales/              # i18n（zh_TW、en）
├── icons/                 # 擴充功能圖示
├── screenshots/           # Chrome 線上應用程式商店截圖
├── tools/                 # 商店截圖擷取腳本
└── docs/
    ├── promo/             # 簡介動畫成品（GIF、MP4）
    └── design/            # 簡介動畫原始檔（HyperFrames）
```

### 測試

1. 在開發者模式下載入未封裝的擴充功能
2. 造訪含有標題的頁面（例如 Wikipedia 文章）
3. 點選擴充功能圖示開啟目錄
4. 暗色主題：切換系統深色模式，或在主控台執行 `document.documentElement.style.colorScheme = 'dark'`

---

## 🤝 貢獻

歡迎參與貢獻！

1. Fork 此專案
2. 建立功能分支 — `git checkout -b feature/amazing-feature`
3. 提交變更 — `git commit -m 'Add amazing feature'`
4. 推送分支 — `git push origin feature/amazing-feature`
5. 開啟 Pull Request

問題回報請到 [GitHub Issues](https://github.com/bobo52310/EagleToc/issues)。

---

## 📄 授權

MIT — 詳見 [LICENSE](LICENSE)

---

Made by [Bobo Chen](https://bobochen.dev) · 如果這個專案對你有幫助，歡迎給一顆星星 ⭐
