# 設計文件：「迎戰變局」Slack 敏捷簡報網頁化

日期：2026-07-02

## 背景與目標

將簡報 PDF《迎戰變局：用敏捷思維與 Slack，打造高適應力企業》（`~/Downloads/迎戰變局 Slack敏捷簡報.pdf`，37 頁）轉製成一個可發布在自訂網域 **slack.tw**（透過 GitHub Pages）的單頁網站，取代原本的投影片檔案，方便分享與長期維護。

內容來源已萃取為完整逐頁文字（見本次對話紀錄），敘事主軸為四段式結構：
1. Part 1 · 破冰開場 — Slack 的敏捷轉向故事
2. Part 2 · 為什麼要敏捷 — 傳統管理模式的困境
3. Part 3 · 敏捷看 Slack — 四大痛點對應四種 Slack 解法
4. Part 4 · 結語交棒 — 從敏捷基底走向 AI 賦能

## 一、內容架構（Information Architecture）

不逐頁翻譯投影片，而是把同主題內容合併為網頁區塊：

| 區塊 | 對應投影片 | 內容重點 |
|---|---|---|
| Hero | slide 1 | 標題「迎戰變局」+ 副標「用敏捷思維與 Slack，打造高適應力企業」+ Slack 四色點綴 |
| Overview | slide 2 | 「四段旅程，一個結論」+ 四個 Part 的時間/主題卡片，同時作為錨點導覽 |
| Part 1 · 破冰開場 | slide 3–8 | Glitch 遊戲公司故事 → 關鍵一步：轉向 (Pivot) → 史上最快獨角獸數據 → "Plan to adapt" 金句 |
| Part 2 · 為什麼要敏捷 | slide 9–19 | 黑天鵝常態化 → 不確定性是新常態 → 命令與控制的致命假設 → 70-90% 創新失敗率 → 小步快跑 vs 一次性大計畫 → 企業需要的兩種能力 |
| Part 3 · 敏捷看 Slack | slide 20–31 | 四大痛點地圖 → 四個「敏捷痛點 × Slack 解法」卡片（跨部門協作／消除切換成本／賦能團隊／以客戶為中心，各附成效數據與案例）→ 四數字總結（+47%／-32%／-27%／+23%） |
| Part 4 · 結語交棒 | slide 32–37 | 靈魂/神經系統/大腦三段論（敏捷思維／Slack／AI）→ 導入 Slack 不是換聊天軟體 → Thank you → 資料來源（footer） |

每個 Part 開頭做成該區塊的「章節分隔區」（滿版背景色 + 大數字 01–04），作為滾動時的視覺呼吸點。

## 二、視覺設計系統

- **配色**：沿用 Slack 品牌色 —— 茄紫 `#4A154B`、藍 `#36C5F0`、綠 `#2EB67D`、紅 `#E01E5A`、黃 `#ECB22E`。重新設計版面比例，不套用投影片式滿版色塊堆疊。
- **標題字體**：原簡報大標題為粗體手寫感中文字（如「迎戰變局」），因授權字型無法還原，改用 Google Fonts **ZCOOL KuaiLe（站酷快樂體）** 作為視覺相近的替代字體，僅用於 H1 與分隔區大標題。
- **內文字體**：Noto Sans TC，加大行高（line-height ≥ 1.7）與字距，改善中文段落可讀性。
- **可複用元件**：
  - 痛點/解法對照卡（紅色 pill 標籤「敏捷痛點」vs 綠色 pill 標籤「Slack 價值」）
  - 大數字統計區塊（如 15K→1.1M、70-90%、+47%）
  - 金句區塊（左側色條 + 大字引言）
  - Before/After 對照卡（如「轉向之後」卡片）

## 三、Mobile 優化與換行排版修正

1. **CJK 斷行**：全域套用 `overflow-wrap: break-word` + 中文內文使用 `line-break: strict`，避免標點符號（，。」）被推到行首、避免英文詞彙（Slack、Salesforce）被硬切一半。
2. **標題字級用 `clamp()`**：如 `font-size: clamp(1.8rem, 5vw, 3.5rem)`，隨螢幕寬度縮放，避免手機上大標題被迫斷成 4–5 行。
3. **統計數字區**：手機版由橫排改直排 stack，避免擠壓變形。
4. **雙欄卡片（痛點 vs 解法、Before/After）**：手機版強制單欄堆疊。
5. **中英文混排間距**：中英文相鄰處加半形空白（如「Slack 本身」），延續原簡報排版習慣。
6. **實測驗證**：完成後於瀏覽器實際縮到 375px（iPhone SE）與 390px 寬度，檢查斷行與觸控區域大小（互動元素最小 44×44px）。

## 四、導覽設計

滾動時螢幕頂部固定一條細導覽列，顯示目前所在 Part（1–4）與整體滾動進度條，點擊可跳轉至對應區塊。手機版縮成小型浮動進度指示點，不佔用過多版面。

## 五、微動畫設計

1. **捲動淡入（Scroll Reveal）**：`IntersectionObserver` 監聽區塊進入視窗，觸發 `opacity: 0→1` + `translateY(16px→0)`，約 500ms、ease-out。純 CSS transition + JS 切換 class，不引入動畫函式庫。
2. **數字滾動計數**：統計數字區塊（15K→1.1M、70-90%、+47% 等）進入視窗時觸發從 0 跑到目標值的計數動畫（約 1–1.5 秒），以 `requestAnimationFrame` 實作；百分比/倍數符號固定在動畫外層，不參與跑動。
3. **章節分隔區背景漸層**：Part 1–4 滿版色塊分隔頁背景以 CSS `background-position` 動畫緩慢漂移（15–20 秒循環），營造呼吸感但不搶眼。
4. **無障礙與效能**：所有動畫加上 `prefers-reduced-motion: reduce` media query，使用者開啟系統減少動態效果時直接跳過動畫改為靜態顯示；手機版動畫幅度略微縮小以維持流暢度。

## 六、技術架構

- **純靜態單一頁面**：`index.html` + `style.css` + `script.js`（處理滾動導覽高亮、進度條、Scroll Reveal、數字計數），不使用框架或建置流程。
- **Repo 結構**：
  ```
  /index.html
  /style.css
  /script.js
  /CNAME                          ← 內容為 slack.tw
  /.github/workflows/deploy.yml
  /docs/                          ← 既有的內容萃取文件（seminar-content.md 等），不影響部署
  ```

## 七、部署與 CI/CD

- **Repo**：假設為使用者既有 GitHub repo（名稱 `slacktw`，owner 待使用者於實作階段確認/建立遠端並自行 push；本次工作範圍不含任何 git push 或遠端操作）。
- **GitHub Actions**：push 到 `main` 分支時，自動觸發 workflow，使用官方 `actions/configure-pages` + `actions/upload-pages-artifact` + `actions/deploy-pages` 部署到 GitHub Pages（因為是純靜態檔案，不需要 build step，只需上傳整個 repo 根目錄或指定的靜態資源目錄）。
- **GitHub repo 設定**：需在 repo 的 Settings → Pages 將來源設定為 GitHub Actions（而非傳統的 branch 部署）。
- **自訂網域（slack.tw 為 apex/根網域）**：
  - Repo 根目錄加入 `CNAME` 檔案，內容為 `slack.tw`。
  - DNS 需在網域註冊商後台設定 4 筆 A 記錄指向 GitHub Pages IP：
    - `185.199.108.153`
    - `185.199.109.153`
    - `185.199.110.153`
    - `185.199.111.153`
  - 此 DNS 設定需使用者自行至網域註冊商後台操作，不在本次實作範圍內（僅提供 CNAME 檔案與說明文件）。

## 範圍界定（Scope）

**包含**：
- 單一 `index.html`（含全部四段落內容）、`style.css`、`script.js`
- `CNAME` 檔案
- `.github/workflows/deploy.yml`
- 更新 `docs/` 下的說明（若需要）

**不包含**：
- 任何 git/GitHub 遠端操作（push、建立 repo、設定 Pages 來源、設定 GitHub Secrets）
- DNS 設定操作（僅提供文件指引）
- 內容管理系統或多頁面路由（本專案僅單頁）
