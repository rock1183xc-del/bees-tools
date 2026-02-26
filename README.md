# 我愛里蜂群好用工具集錦

響應式工具集錦頁面，支援電腦與手機。卡片展示工具連結，使用者可自訂外觀，管理者以密碼新增工具。

## 啟動方式

1. 複製環境變數範例：`cp .env.example .env`
2. 編輯 `.env`，設定 `ADMIN_PASSWORD`（管理者密碼）與選填 `PORT`（預設 3000）
3. 安裝依賴：`npm install`
4. 啟動：`npm run dev` 或 `npm start`
5. 瀏覽 http://localhost:3000

## 部署到 Vercel（推薦：各地夥伴知道連結就能用）

和你的「限動文案生成器」一樣，部署到 Vercel 後會得到一個網址（例如 `https://bee-tools-hub-xxx.vercel.app`），**只把連結分享給夥伴**，不對外宣傳，大家在不同地區都能開。

### 步驟

1. **程式碼放到 GitHub**  
   把此專案 push 到你的 GitHub repo（若還沒有）。

2. **在 Vercel 匯入專案**  
   登入 [Vercel](https://vercel.com) → Add New → Project → 選這個 repo，直接 Deploy（先不用改設定）。

3. **連結 Upstash Redis（存工具列表）**  
   - 在 Vercel 專案裡：Settings → Integrations → 搜尋 **Upstash Redis** → 安裝並連結到這個專案（會自動建立一個 Redis 資料庫並注入環境變數）。
   - 若沒有 Integration，可改用手動：到 [Upstash Console](https://console.upstash.com) 建立 Redis，把 `UPSTASH_REDIS_REST_URL`、`UPSTASH_REDIS_REST_TOKEN` 加到 Vercel 的 Environment Variables。

4. **設定管理者密碼**  
   Vercel 專案 → Settings → Environment Variables → 新增：
   - Name: `ADMIN_PASSWORD`
   - Value: 你的管理者密碼

5. **重新部署**  
   Deployments → 最新那次的 ⋮ → Redeploy。完成後用專案網址（例如 `https://xxx.vercel.app`）開站，把這網址分享給夥伴即可。

### 本機開發 vs Vercel

- **本機**：執行 `npm run dev`，用 `server.js` + `data/tools.json`，開 http://localhost:3000。
- **Vercel**：用 `api/tools.js` + Upstash Redis，工具列表存在雲端，所有人看到同一份。

---

## 分享給夥伴（不部署、只在同網段）

若暫時不部署，只要同一個 WiFi / 區域網路：

1. 在你電腦上執行 `npm run dev`。
2. 終端機會顯示 **`同網段夥伴可開： http://192.168.x.x:3001`**，把這網址分享給同 WiFi 的夥伴即可。

## 功能

- **標題**：我愛里蜂群好用工具集錦
- **工具卡片**：點擊開新分頁前往連結
- **設定**：主題色、字體大小、卡片間距與圓角（儲存於本機瀏覽器）
- **管理者**：輸入密碼後可新增工具（名稱、網址、說明）

## 專案結構

- `index.html`：單頁結構
- `css/style.css`：樣式與響應式、CSS 變數
- `js/app.js`：拉取 API、渲染卡片、設定與管理者彈窗
- `server.js`：本機用 Express API + 靜態檔案
- `api/tools.js`：Vercel 部署用 serverless API（讀寫 Upstash Redis）
- `data/tools.json`：本機用工具列表
