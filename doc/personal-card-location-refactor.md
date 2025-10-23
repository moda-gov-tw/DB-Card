# 個人版名片地址 → 座標設計草案

## 背景與目標
- 目前個人版（含雙語版）以自由文字儲存地址，容易導致 NFC URL 超過容量限制。
- 需求：改採座標儲存並生成外部地圖連結，以降低資料量，同時保有相容性。

## 資料結構調整
- 新欄位（共用概念）：
  - `location.coords`: 字串 `"<lat>,<lng>"`，緯度與經度保留最多 6 位小數。
  - `location.label`: 使用者自訂的顯示文字。單語版為單一字串，雙語版以 `zh~en` 儲存。
- compact 資料欄位：
  - 單語個人版 JSON：新增 `lc`（coords）、`ll`（label），既有 `addr` 繼續保留供回退。
  - 雙語個人版 JSON：新增 `locationCoords`（coords）、`locationLabel`（label）。
  - 解析流程統一還原成 `data.location = { coords, label }`，缺少時以 `address` 萃取。
- 相容性：
  - 前端顯示與 vCard 生成優先使用 `location`，無新欄位時才回退 `address`。
  - `encodeCompact` / `decodeCompact` / `convertCompactToFull` 需擴充為支援新欄位並維持舊版資料解析。

## 前端調整項目
### 生成器（單語：`nfc-generator.html`）
- 個人版地址區塊改為「緯度 / 經度」與「地點標籤」輸入欄位。
- 驗證與格式處理：
  - 緯度介於 -90〜90，經度介於 -180〜180。
  - 自動修剪空白，容許逗號、分號或空白分隔緯經度並自動拆解。
  - 貼上 Google 地圖複製的格式（例如 `25.03675036025628, 121.5088190942485`）時，自動解析成兩個數字並四捨五入至 6 位小數以縮減容量。
  - 標籤可留空，但若輸入需限制長度（建議 30 字以內）。
- 生成資料時：
  - 寫入 `cardData.lc`、`cardData.ll`，同時保留 `addr` 以保持舊資料相容。
- UI 強化：
  - 提供「如何從 Google 地圖複製座標」的說明（搜尋地點 → 右鍵「這裡嗎？」→ 複製 `<lat>,<lng>`）與快速連結，協助使用者手動取得座標。
  - 保留並更新 URL bytes 提示，讓使用者知悉座標欄位同樣列入容量計算。

### 生成器（雙語：`nfc-generator-bilingual.html`）
- 個人版地址欄位改為緯度、經度，以及中英標籤輸入。
- `collectFormData()` 生成：
  - `locationCoords` → `"<lat>,<lng>"`。
  - `locationLabel` → `"<zh>~<en>"`。
- 容量監控、預覽等流程沿用新欄位。
- 提供中英雙語的 Google 地圖座標取得指引與連結，確保兩語使用者皆能操作。
- 解析 Google 地圖貼上的座標字串時同樣自動拆解並四捨五入至 6 位小數，維持資料精度與容量平衡。

### 展示頁
- 單語版（`index-personal.html` / `index-personal-en.html`）：
  - `renderCard()` 解析 `lc` / `ll` 成 `data.location`。
  - 存在座標時顯示「查看地圖」超連結，連結基礎 URL 由常數 `MAP_BASE_URL` 控制（預設 Google Maps）。
  - 無座標但有舊地址時延用原有文字顯示。
- 雙語版（`index-bilingual-personal.html`）：
  - `renderPersonalCard()` 依語系顯示 `location.label` 中對應語言。
  - 若有座標，生成對應語言的地圖連結；缺座標時回退舊地址顯示。
- 安全性：
  - 更新 `SecurityUtils` 白名單，將 `MAP_BASE_URL` 所指向的網域（預設 `maps.google.com`、`www.google.com/maps`）加入允許名單。
  - 若未來切換至其他地圖服務，僅需調整常數與白名單設定。

## vCard 生成
- 單語版：
  - 有座標時新增 `GEO:<lat>;<lng>` 與 `URL:${MAP_BASE_URL}?q=<lat>,<lng>`，只在缺座標時才輸出 `ADR`。
- 雙語版（`generateBilingualVCard`）：
  - 同樣改用 `GEO` + `URL`；若缺座標則沿用現行 `ADR`。
- `MAP_BASE_URL` 預設為 Google Maps，後續若需支援 OpenStreetMap、Apple Maps 等，只需調整常數即可；GEO 欄位仍可被裝置的預設地圖應用辨識。

## 系統結構擴充
- **資料層**：新增 `location` 物件及 `lc` / `ll` / `locationCoords` / `locationLabel` 欄位，並調整 compact 編碼流程以維持前後端一致。
- **前端共用模組**：
  - `SecurityUtils`：擴充地圖白名單與安全檢查函式，確保動態生成的地圖連結安全可靠。
  - `bilingual-common.js`：新增位置欄位解析、`MAP_BASE_URL` 常數與 vCard GEO/URL 生成邏輯。
- **頁面層**：
  - 生成器頁面（單語／雙語）負責輸入驗證、座標格式化與容量監測。
  - 展示頁面（單語／雙語）負責視覺呈現、地圖超連結與 vCard 下載。
- **設定層**：將 `MAP_BASE_URL` 列為可覆寫常數（後續可延伸為環境變數或設定檔），預設值與允許網域需同步管理。

## 實作藍圖
- 模組責任
  - `nfc-generator.html`：新增座標欄位 UI、貼上格式容錯、寫入 `lc` / `ll`。
  - `nfc-generator-bilingual.html`：同上且處理 `locationCoords` / `locationLabel` 雙語字串。
  - `index-personal*.html`：解析 `location` 物件、渲染地圖連結與更新 vCard GEO 欄位。
  - `assets/bilingual-common.js`：擴充 `encodeCompact` / `decodeCompact`、`renderBilingualCard`、`generateBilingualVCard`。
  - `assets/security-utils.js`：加入地圖網域白名單、輸入格式清理工具函式（拆解座標、固定小數位數）。
- 資料流程
  1. 生成器輸入 → 轉換為 `lc` / `ll`（或 `locationCoords` / `locationLabel`）→ 壓縮成 URL。
  2. 展示頁解碼 → 轉成 `location` 物件 → 顯示資訊並提供地圖連結 / vCard。
  3. vCard 下載 → 嵌入 GEO 欄與可配置的地圖 URL。

## 落地規劃
1. **準備階段**
   - 定義 `MAP_BASE_URL` 常數與允許網域名單。
   - 實作共用的座標解析與格式化工具（含小數位數限制）。
2. **前端生成器調整**
   - 單語與雙語生成器同步更新 UI、容錯邏輯及資料寫入欄位。
   - 調整容量監控字串，驗證貼上 Google Maps 座標範例。
3. **展示頁與 vCard 更新**
   - 單語／雙語頁面解析 `location`、更新聯絡資訊與 vCard 內容。
   - 確認 `MAP_BASE_URL` 套用在所有地圖連結與 vCard URL 欄位。
4. **安全與測試**
   - 更新 `SecurityUtils` 白名單並加入單元測試／手動測試情境（六項測試案例）。
   - 針對舊資料、新資料與混合資料進行瀏覽、vCard 下載與 NFC URL 容量驗證。

## 實作進度追蹤
### 2025-10-23: Task 1.2 完成
- ✅ 更新 `assets/bilingual-common.js` 中的 `encodeCompact` 函式
  - 新增 `serializeLocation` 內部函式，支援序列化 `location.coords` 和 `location.label`
  - 格式：`lat,lng;label` 或 `lat,lng` 或 `label`
  - 擴充 compact 陣列新增第 12 個欄位（location）
- ✅ 實作測試驅動開發
  - 建立 `test-location-encoding.js` 測試檔案
  - 涵蓋四種情境：coords+label、僅 coords、僅 label、無 location
  - 驗證編碼/解碼往返一致性
- 📝 備註：`decodeCompact` 已於先前實作支援 location 解析，本次僅更新 encode 端

## 測試情境
1. **舊資料只含 `address`**：頁面與 vCard 均使用舊地址，不出錯。
2. **新資料只有 `location`**：頁面顯示外部地圖連結，vCard 僅含 GEO / URL，容量顯著下降。
3. **新舊欄位共存**：優先顯示 `location`，`address` 作為後備。
4. **雙語語言切換**：`location.label` 隨語系切換，連結正確。
5. **生成器驗證**：座標範圍、標籤長度、URL bytes 指示皆正常。
6. **手動輸入容錯**：測試使用逗號、分號、空白等不同分隔符時能正確解析並提示錯誤。

## 待確認事項
1. `MAP_BASE_URL` 是否需要在部署時可自訂（環境變數或設定檔）。

## 後續步驟建議
1. 調整生成器、共用函式與展示頁以支援 `location` 新欄位。
2. 將地圖連結基礎 URL 抽離成常數，並強化輸入格式處理（自動修剪、多分隔符容錯、錯誤訊息）。
3. 完成後針對六項測試情境覆蓋驗證容量、顯示結果與錯誤處理。

## 未來擴充事項
- 研究導入輕量級 Geocoding API，自動將使用者輸入的地址轉換為座標，並提供手動輸入作為備援。
