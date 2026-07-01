# slack.tw — 迎戰變局簡報網頁

單頁靜態網站，內容改編自簡報《迎戰變局：用敏捷思維與 Slack，打造高適應力企業》。

## 本機預覽

    python3 -m http.server 8000

開啟 http://localhost:8000

## 執行單元測試

    node script.test.js

## 部署

push 到 `main` 分支後，GitHub Actions（`.github/workflows/deploy.yml`）會自動部署到 GitHub Pages。

首次啟用需要在 repo 的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。

## 自訂網域 slack.tw 設定

1. Repo 根目錄已包含 `CNAME` 檔案（內容為 `slack.tw`）。
2. 到網域註冊商後台，將 `slack.tw` 設定 4 筆 A 記錄指向：
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
3. 等待 DNS 生效後，於 repo 的 **Settings → Pages** 頁面填入自訂網域並啟用 HTTPS。
