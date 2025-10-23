# 專案決策記錄

## DECISION-2025-10-23-001: Google Maps ID 支援實作

### 背景
個人版名片地址重構需求，基於設計文件 `doc/personal-card-location-refactor.md` 實作 Google Maps ID 支援以優化 NFC 容量使用。

### 決策
1. **容量優化策略**: 採用 Google Maps ID (17 字元) 取代完整 URL (42 字元)，節省 59% 容量
2. **三選一輸入模式**: 文字地址、GPS 座標、Google Maps 連結，讓使用者選擇最適合的格式
3. **智慧連結生成**: 優先順序處理 (Google Maps ID > GPS 座標 > 文字地址)
4. **安全驗證**: 擴充白名單、ID 格式驗證、安全事件記錄

### 實作範圍
- **核心函式**: extractGoogleMapsId, validateGoogleMapsId, normalizeCoordinate
- **UI 更新**: 生成器三選一模式、展示頁智慧連結
- **安全強化**: SecurityUtils 集中化驗證、白名單擴充
- **向下相容**: 完整保留舊版本資料格式支援

### 影響檔案
- assets/bilingual-common.js: extractGoogleMapsId 函式
- assets/security-utils.js: validateGoogleMapsId 安全驗證
- nfc-generator.html: 三選一地址模式 UI
- nfc-generator-bilingual.html: 雙語版三選一模式
- index-personal.html: 智慧連結生成
- index-personal-en.html: 英文版智慧連結生成

## DECISION-2025-10-23-002: Google Maps 自訂標籤功能

### 背景
使用者反饋希望能自訂 Google Maps 連結的顯示文字，而非固定顯示「📍 Google Maps」。

### 決策
1. **功能範圍**: 僅針對 Google Maps 連結新增自訂標籤功能（最小化實作）
2. **字數限制**: 單語版 20 字元，雙語版各 20 字元（容量考量）
3. **雙語支援**: 使用 `zh~en` 格式儲存，語言切換時正確顯示
4. **顯示邏輯**: 優先使用自訂標籤，空值時回退預設 "Google Maps"

### 實作範圍
- **UI 擴充**: 單語版單一欄位，雙語版中英文分離輸入
- **字數統計**: 即時顏色提示（0-10 綠色、10-20 黃色、>20 紅色）
- **容量整合**: 標籤字數自動計入 NFC 容量計算
- **向下相容**: 空標籤時自動使用預設值

### 影響檔案
- nfc-generator.html: 單語版標籤輸入與字數統計
- nfc-generator-bilingual.html: 雙語版標籤輸入與容量監控
- index-personal.html: 單語展示頁標籤優先顯示
- index-personal-en.html: 英文展示頁標籤優先顯示
- index-bilingual-personal.html: 雙語展示頁地圖連結重構

## DECISION-2025-10-23-003: 組織名稱地圖連結整合

### 背景
使用者反饋希望避免前端顯示重複資訊，當組織名稱與地址標籤相同時會出現兩行相同內容。同時希望組織名稱能具備地圖導航功能。

### 決策
1. **組織名稱地圖連結化**: 組織名稱本身變成可點擊的地圖連結
2. **智慧去重機制**: 相同內容時隱藏重複欄位，避免冗餘資訊
3. **雙重功能整合**: 組織名稱 = 身份識別 + 地圖導航
4. **視覺設計統一**: hover 效果與現有設計風格保持一致

### 實作範圍
- **雙語版本**: 智慧比較組織名稱與地址標籤，相同時隱藏組織欄位
- **單語版本**: 組織名稱地圖連結化，保持漸層背景設計
- **樣式整合**: hover 效果與顏色變化
- **安全機制**: 使用現有 createMapLinkElement 確保連結安全性

### 影響檔案
- index-bilingual-personal.html: 雙語版組織地圖連結與智慧去重
- index-personal.html: 單語中文版組織地圖連結
- index-personal-en.html: 單語英文版組織地圖連結
- doc/personal-card-location-refactor.md: v2.1.9 功能文檔

### 狀態
✅ **已完成** (2025-10-23)

### 使用者體驗提升
- 功能整合: 組織名稱具備雙重功能
- UI 簡潔: 減少冗餘資訊顯示
- 直覺操作: 點擊組織名稱即可導航
- 視覺一致: hover 效果與設計風格統一

