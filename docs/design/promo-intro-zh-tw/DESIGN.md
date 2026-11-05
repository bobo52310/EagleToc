# EagleToc 簡介動畫 — Design Baseline

## 品牌來源
品牌色沿用官網版 `EagleToc-website/docs/design/promo-intro-zh-tw/DESIGN.md`（navy / cyan / sky）。本片刻意不同的只有底色：官網版是白底，本片是高空深藍，以承載「高度」隱喻。

| Token | 值 | 用途 |
|---|---|---|
| `--sky-950` | `#070d2b` | 場景底色（高空夜藍） |
| `--sky-900` | `#0f1a4f` | 次底色、pill 底 |
| `--brand-navy` | `#0a3a6e` | 官網品牌色：深端 |
| `--brand-cyan` | `#2196F3` | 官網品牌色：中段 |
| `--brand-sky` | `#38b6ff` | 官網品牌色：亮藍 accent、路標、highlight |
| `--ink-50` | `#f2f6ff` | 主文字 |
| `--ink-300` | `#b9c7e6` | 次文字（在 sky-950 上需過 AA） |

`.hl` 漸層：`#7cc4ff → #38b6ff`。不新增色相；真實截圖內的顏色不受此限。

## 字型
`"Noto Sans TC", "Inter", "PingFang TC", system-ui, sans-serif`；標題 700–900 字重。

## 敘事核心
- 隱喻：**高度**。迷路是因為站得太低；EagleToc 把你帶到鷹的高度。
- 金句：「不是文章太長，是你站得太低。」
- 首尾呼應：開場問「這篇文章，你讀到哪了？」，收尾答「你在這裡。」

## 真實性與隱私
- 產品畫面一律真實擷取，不手刻假 UI；標題與數字來自 `assets/capture/manifest.json`。
- 產品全程在本機處理，文案不暗示任何自有伺服器或雲端。
- README 沒有創辦人語錄，**不得虛構創辦人故事**；Heart 用官方標語「鷹眼俯瞰，精準導航」。
