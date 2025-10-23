# 個人版名片地址 → 座標設計草案

## 背景與目標
- 目前個人版（含雙語版）以自由文字儲存地址，容易導致 NFC URL 超過容量限制。
- 需求：改採座標儲存並生成外部地圖連結，以降低資料量，同時保有相容性。
- **v2.1.6 更新**：新增 Google Maps 分享連結支援，進一步優化容量使用。

## 資料結構調整

### 新欄位設計（v2.1.6 優化版）
- `location.coords`: 字串 `"<lat>,<lng>"`，緯度與經度保留 7 位小數精度 (~1 公分精度)。
- `location.mapId`: Google Maps 分享連結 ID（如：`eKmgu7PqiUfJ2v5D9`），僅 17 字元。
- `location.label`: 使用者自訂的顯示文字。單語版為單一字串，雙語版以 `zh~en` 儲存。

### 容量優化對比
| 方案 | 儲存內容 | 字元數 | 容量效益 |
|------|----------|--------|----------|
| 文字地址 | `臺北市信義區信義路五段7號` | 15+ 字元 | 基準 |
| GPS 座標 | `25.0339641,121.5644683` | 22 字元 | +47% |
| **Google Maps ID** | `eKmgu7PqiUfJ2v5D9` | **17 字元** | **+13%** ✅ |

### compact 資料欄位
- 單語個人版 JSON：新增 `lc`（coords）、`lm`（mapId）、`ll`（label），既有 `addr` 繼續保留供回退。
- 雙語個人版 JSON：新增 `locationCoords`（coords）、`locationMapId`（mapId）、`locationLabel`（label）。
- 解析流程統一還原成 `data.location = { coords, mapId, label }`，缺少時以 `address` 萃取。

### 相容性策略
- 前端顯示與 vCard 生成優先使用 `location`，無新欄位時才回退 `address`。
- 支援三種位置格式：GPS 座標、Google Maps ID、文字地址。
- `encodeCompact` / `decodeCompact` / `convertCompactToFull` 需擴充為支援新欄位並維持舊版資料解析。

## 前端調整項目

### 生成器（單語：`nfc-generator.html`）
- 個人版地址區塊改為三選一：「文字地址」、「GPS 座標」、「Google Maps 連結」。
- **Google Maps 連結模式**：
  - 輸入完整分享連結：`https://maps.app.goo.gl/eKmgu7PqiUfJ2v5D9`
  - 系統自動提取 ID：`eKmgu7PqiUfJ2v5D9`
  - 節省容量：17 字元 vs 42 字元完整 URL
- **GPS 座標模式**：
  - 緯度介於 -90〜90，經度介於 -180〜180。
  - 支援 7 位小數精度 (~1 公分精度)，確保地址標記準確性。
  - 自動修剪空白，容許逗號、分號或空白分隔緯經度並自動拆解。
  - 標籤可留空，但若輸入需限制長度（建議 30 字以內）。
- 生成資料時：
  - 寫入 `cardData.lc`、`cardData.lm`、`cardData.ll`，同時保留 `addr` 以保持舊資料相容。
- UI 強化：
  - 提供「如何從 Google Maps 取得分享連結」的說明
  - 提供「如何從 Google Maps 複製座標」的說明
  - 保留並更新 URL bytes 提示，讓使用者知悉各種格式的容量影響

### 生成器（雙語：`nfc-generator-bilingual.html`）
- 個人版地址欄位改為三選一模式。
- `collectFormData()` 生成：
  - `locationCoords` → `"<lat>,<lng>"`（7 位小數精度）。
  - `locationMapId` → Google Maps ID 字串。
  - `locationLabel` → `"<zh>~<en>"`。
- 容量監控、預覽等流程沿用新欄位。
- 提供中英雙語的操作指引。

### 展示頁
- 單語版（`index-personal.html` / `index-personal-en.html`）：
  - `renderCard()` 解析 `lc` / `lm` / `ll` 成 `data.location`。
  - 優先順序：Google Maps ID > GPS 座標 > 文字地址。
  - Google Maps ID 時組裝完整 URL：`https://maps.app.goo.gl/${mapId}`。
  - GPS 座標時生成 Google Maps 查詢 URL：`https://maps.google.com/?q=${lat},${lng}`。
  - 無座標但有舊地址時延用原有文字顯示。
- 雙語版（`index-bilingual-personal.html`）：
  - `renderPersonalCard()` 依語系顯示 `location.label` 中對應語言。
  - 地圖連結生成邏輯與單語版相同。
- 安全性：
  - 更新 `SecurityUtils` 白名單，將 `maps.app.goo.gl` 和 `maps.google.com` 加入允許名單。
  - Google Maps ID 格式驗證：僅允許 `[a-zA-Z0-9]+` 字元。

## vCard 生成
- 單語版：
  - 有 Google Maps ID 時：`URL:https://maps.app.goo.gl/${mapId}`
  - 有 GPS 座標時：`GEO:${lat};${lng}` 與 `URL:https://maps.google.com/?q=${lat},${lng}`
  - 僅有文字地址時：`ADR:${address}`
- 雙語版（`generateBilingualVCard`）：
  - 同樣的優先順序邏輯
- 地圖服務可配置：`MAP_BASE_URL` 預設為 Google Maps

## 系統結構擴充
- **資料層**：新增 `location` 物件及 `lc` / `lm` / `ll` / `locationCoords` / `locationMapId` / `locationLabel` 欄位
- **前端共用模組**：
  - `SecurityUtils`：擴充 Google Maps 白名單與 ID 格式驗證
  - `bilingual-common.js`：新增 `extractGoogleMapsId()` 函式與地圖連結生成邏輯
- **頁面層**：
  - 生成器頁面：三選一地址輸入模式，Google Maps ID 提取與驗證
  - 展示頁面：智慧地圖連結生成，優先順序處理
- **設定層**：`MAP_BASE_URL` 與 `GOOGLE_MAPS_SHARE_BASE` 常數管理

## 實作藍圖
- 模組責任
  - `nfc-generator.html`：三選一地址輸入 UI、Google Maps ID 提取、寫入 `lc` / `lm` / `ll`
  - `nfc-generator-bilingual.html`：同上且處理雙語格式
  - `index-personal*.html`：解析 `location` 物件、智慧地圖連結生成、更新 vCard
  - `assets/bilingual-common.js`：擴充編碼解碼、`extractGoogleMapsId`、地圖連結生成
  - `assets/security-utils.js`：Google Maps 網域白名單、ID 格式驗證
- 資料流程
  1. 生成器輸入 → 提取/轉換為 `lc` / `lm` / `ll` → 壓縮成 URL
  2. 展示頁解碼 → 轉成 `location` 物件 → 智慧連結生成 → 顯示與 vCard
  3. 優先順序：Google Maps ID > GPS 座標 > 文字地址 > 無地址

## 實作進度追蹤

### 2025-10-23: 完整實作完成
- ✅ **Location Object 實作**: 新增結構化座標資料 `{coords: {lat, lng}, label}`
- ✅ **編碼優化**: 12 欄位格式支援，parseLocation/serializeLocation 函式
- ✅ **vCard GEO 屬性**: generateBilingualVCard 使用標準 GEO 格式
- ✅ **顯示邏輯**: renderPersonalCard 優先讀取 location.label
- ✅ **生成器座標輸入**: 單語/雙語版本支援 GPS 座標與文字地址切換
- ✅ **單語展示頁**: location 解析與 Google Maps 連結生成
- ✅ **MAP_BASE_URL 常數**: 地圖基礎 URL 與連結生成函式
- ✅ **安全配置**: 地圖網域白名單與 URL 驗證
- ✅ **座標精度優化**: 從 6 位小數提升至 7 位小數 (~1 公分精度)
- ✅ **輸入一致性**: HTML step 與 JavaScript toFixed 統一為 7 位小數

### 2025-10-23: Google Maps ID 方案設計
- 📋 **容量優化策略**: Google Maps ID 儲存方案（17 字元 vs 42 字元完整 URL）
- 📋 **三選一輸入模式**: 文字地址、GPS 座標、Google Maps 連結
- 📋 **智慧連結生成**: 優先順序處理與 URL 組裝邏輯
- 📋 **安全驗證**: Google Maps ID 格式驗證與白名單擴充

## 測試情境
1. **舊資料只含 `address`**：頁面與 vCard 均使用舊地址，不出錯。
2. **新資料只有 GPS 座標**：頁面顯示 Google Maps 查詢連結，vCard 含 GEO 屬性。
3. **新資料只有 Google Maps ID**：頁面顯示完整分享連結，vCard 含 URL 屬性。
4. **新舊欄位共存**：優先顯示新格式，`address` 作為最後回退。
5. **雙語語言切換**：`location.label` 隨語系切換，連結正確。
6. **生成器驗證**：三種輸入模式、容量提示、格式驗證皆正常。
7. **容量優化**：Google Maps ID 比座標節省 23% 容量。

## 待確認事項
1. Google Maps ID 的有效期限與穩定性。
2. 是否需要支援其他地圖服務（Apple Maps、OpenStreetMap）。

## 後續步驟建議
1. **實作 Google Maps ID 方案**：
   - 新增 `extractGoogleMapsId()` 函式
   - 修改生成器 UI 為三選一模式
   - 更新展示頁面智慧連結生成
   - 擴充安全驗證與白名單
2. **完善測試驗證**：針對七項測試情境進行完整驗證
3. **文檔更新**：更新使用說明與操作指引

## 未來擴充事項
- 研究 Apple Maps 分享連結格式支援
- 考慮 OpenStreetMap 等開源地圖服務整合
- 評估地圖服務可用性監控機制
