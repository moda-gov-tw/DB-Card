# Short-Term Memory (STM)

## 2025-10-23 - Google Maps ID 支援實作

### Task 2.1: extractGoogleMapsId 函式實作
**檔案**: `assets/bilingual-common.js`

**修改內容**:
- 新增 `extractGoogleMapsId()` 函式用於從 Google Maps 分享連結提取 ID
- 新增 `GOOGLE_MAPS_SHARE_BASE` 常數定義分享連結基礎 URL
- 位置: bilingual-common.js:81-115

**變更詳情**:
```javascript
// 新增函式：從 Google Maps 分享連結中提取 ID
function extractGoogleMapsId(url) {
    // Pattern: https://maps.app.goo.gl/eKmgu7PqiUfJ2v5D9
    // 驗證 ID 格式：僅允許英數字，長度通常為 17 字元
    // 支援完整 URL 或純 ID 輸入
}
```

**測試驗證**:
- ✅ 能正確提取完整 Google Maps 分享連結中的 ID
- ✅ 能識別純 ID 格式輸入
- ✅ 拒絕無效格式並記錄安全事件
- ✅ ID 格式驗證：10-25 個英數字

**相關文件**:
- 修改檔案: assets/bilingual-common.js
- 影響範圍: 所有使用地圖功能的頁面

---

### Task 2.2: 安全白名單擴充
**檔案**: `assets/security-utils.js`

**修改內容**:
- 新增 `validateGoogleMapsId()` 函式用於驗證 Google Maps ID 格式
- 擴充 `ALLOWED_MAP_DOMAINS` 已包含 `maps.app.goo.gl`
- 位置: security-utils.js:324-346

**變更詳情**:
```javascript
// 新增函式：驗證 Google Maps ID 格式
validateGoogleMapsId: function(mapId) {
    // Google Maps ID 格式：僅允許英數字，長度通常為 10-25 字元
    const isValid = /^[a-zA-Z0-9]{10,25}$/.test(trimmed);
    // 記錄無效格式的安全事件
}
```

**測試驗證**:
- ✅ 白名單包含 `https://maps.app.goo.gl`
- ✅ ID 格式驗證功能正常
- ✅ 安全事件記錄功能正常

**相關文件**:
- 修改檔案: assets/security-utils.js
- 影響範圍: 所有地圖相關安全驗證

---

### Task 2.3: 單語生成器 UI 三選一模式
**檔案**: `nfc-generator.html`

**修改內容**:
- 新增第三個選項「Google Maps 連結」
- 新增 `mapIdAddressGroup` 區塊與 `googleMapsUrl` 輸入欄位
- 更新地址類型切換邏輯支援三種模式
- 位置: nfc-generator.html:308-369, 609-616

**變更詳情**:
```html
<!-- 三選一模式 -->
<input type="radio" name="addressType" value="text">
<input type="radio" name="addressType" value="coords">
<input type="radio" name="addressType" value="mapId"> <!-- 新增 -->
```

**JavaScript 更新**:
- 修改地址類型切換邏輯支援 `mapId` 模式
- 在 `generateNFCUrl()` 中新增 Google Maps ID 處理
- 新增內嵌 `extractGoogleMapsId()` 函式
- 儲存為 `cardData.lm` 欄位

**測試驗證**:
- ✅ UI 顯示三個選項
- ✅ 切換功能正常
- ✅ 容量提示與說明文字完整
- ✅ Google Maps ID 提取與驗證功能正常

**相關文件**:
- 修改檔案: nfc-generator.html
- 影響範圍: 單語個人版面生成器

---

### Task 2.4: 雙語生成器 UI 三選一模式
**檔案**: `nfc-generator-bilingual.html`

**修改內容**:
- 新增第三個選項「Google Maps 連結 / Maps Link」
- 新增 `mapIdAddressGroup` 區塊與雙語說明
- 更新 `toggleAddressType()` 函式支援三種模式
- 更新 `collectFormData()` 處理 Google Maps ID
- 位置: nfc-generator-bilingual.html:346-404, 1090-1109, 826-897

**變更詳情**:
```javascript
// collectFormData() 新增 Google Maps ID 處理
if (addressType.value === 'mapId') {
    const extractedId = extractGoogleMapsId(mapsUrl);
    if (extractedId) {
        location = { mapId: extractedId };
    }
}
```

**測試驗證**:
- ✅ 雙語 UI 顯示正常
- ✅ 三種地址模式切換功能正常
- ✅ Google Maps ID 提取與驗證功能正常
- ✅ 容量優勢說明清晰

**相關文件**:
- 修改檔案: nfc-generator-bilingual.html
- 影響範圍: 雙語個人版面生成器

---

### Task 2.5: 單語展示頁智慧連結生成
**檔案**: `index-personal.html`, `index-personal-en.html`

**修改內容**:
- 更新 `convertCompactToFull()` 解析 `lm` (Google Maps ID) 和 `lc` (座標字串)
- 更新 `renderCard()` 優先顯示 Google Maps ID 連結
- 更新 vCard 生成支援 Google Maps ID (URL 欄位)
- 位置: index-personal.html:992-1020, 765-815, 884-894

**優先順序**:
1. Google Maps ID → `https://maps.app.goo.gl/${mapId}`
2. GPS 座標 → `https://maps.google.com/?q=${lat},${lng}`
3. 文字地址 → 顯示純文字

**vCard 格式**:
```
URL;TYPE=pref:https://maps.app.goo.gl/${mapId}  // Google Maps ID
GEO:${lat};${lng}                                 // GPS 座標
ADR;TYPE=work;CHARSET=UTF-8:;;${address}          // 文字地址
```

**測試驗證**:
- ✅ Google Maps ID 正確解析與顯示
- ✅ GPS 座標字串格式正確解析
- ✅ 舊版 `loc` 物件相容性保留
- ✅ 智慧連結生成與安全驗證正常
- ✅ vCard 包含正確的位置資訊

**相關文件**:
- 修改檔案: index-personal.html, index-personal-en.html
- 影響範圍: 單語個人版面展示頁

---

### Task 2.6: 雙語展示頁更新
**檔案**: `assets/bilingual-common.js`

**修改內容**:
- `encodeCompact()` 和 `decodeCompact()` 已支援 12 欄位格式
- `parseLocation()` 支援 `coords` 和 `label` 解析
- `generateMapLink()` 支援 Google Maps ID 與座標
- 位置: bilingual-common.js:196-351, 916-933

**資料結構**:
```javascript
// location 物件支援三種格式
location: {
    mapId: "eKmgu7PqiUfJ2v5D9",        // Google Maps ID
    coords: { lat: 25.033, lng: 121.564 }, // GPS 座標
    label: "台北101~Taipei 101"         // 雙語標籤
}
```

**測試驗證**:
- ✅ 12 欄位格式編碼解碼正常
- ✅ location 物件序列化與解析正確
- ✅ 地圖連結生成支援多種格式
- ✅ 雙語相容性完整

**相關文件**:
- 修改檔案: assets/bilingual-common.js
- 影響範圍: 雙語版面所有頁面

---

## 2025-10-23 - 座標精度限制實作

### Task 1.1: 單語生成器座標精度限制
**檔案**: `nfc-generator.html`

**修改內容**:
- 在 GPS 座標處理邏輯中新增 6 位小數精度限制
- 位置: nfc-generator.html:646-650
- 實作方法: 使用 `toFixed(6)` 和 `parseFloat()` 限制經緯度精度

**變更詳情**:
```javascript
// Before:
cardData.loc = {
    lat: parsedLat,
    lng: parsedLng
};

// After:
// Limit to 6 decimal precision
cardData.loc = {
    lat: parseFloat(parsedLat.toFixed(6)),
    lng: parseFloat(parsedLng.toFixed(6))
};
```

**測試驗證**:
- ✅ 確保座標輸入會被限制為 6 位小數
- ✅ 精度約為 0.11 公尺（GPS 標準精度）
- ✅ 減少 URL 長度，優化 NFC 容量使用

**相關文件**:
- 修改檔案: nfc-generator.html
- 影響範圍: 個人版面 GPS 座標功能

---

### Task 1.2: 雙語生成器座標精度限制
**檔案**: `nfc-generator-bilingual.html`

**修改內容**:
- 在 HTML 輸入欄位新增 min/max 屬性限制座標範圍
  - 緯度: min="-90" max="90"
  - 經度: min="-180" max="180"
  - 位置: nfc-generator-bilingual.html:372, 376
- 在 JavaScript 處理邏輯中新增 6 位小數精度限制
  - 位置: nfc-generator-bilingual.html:781-785
  - 實作方法: 使用 `toFixed(6)` 和 `parseFloat()` 限制經緯度精度

**變更詳情**:
```html
<!-- HTML 輸入欄位限制 -->
<input type="number" id="latitude" step="0.000001" min="-90" max="90" placeholder="緯度 / Latitude (例如: 25.033964)" style="flex: 1;">
<input type="number" id="longitude" step="0.000001" min="-180" max="180" placeholder="經度 / Longitude (例如: 121.564468)" style="flex: 1;">
```

```javascript
// JavaScript 精度限制
// Before:
location = {
    lat: parsedLat,
    lng: parsedLng
};

// After:
// 限制座標精度為 6 位小數
location = {
    lat: parseFloat(parsedLat.toFixed(6)),
    lng: parseFloat(parsedLng.toFixed(6))
};
```

**測試驗證**:
- ✅ HTML 輸入欄位限制座標有效範圍
- ✅ JavaScript 限制座標為 6 位小數精度
- ✅ 精度約為 0.11 公尺（GPS 標準精度）
- ✅ 減少 URL 長度，優化 NFC 容量使用
- ✅ 與單語版本保持一致的精度標準

**相關文件**:
- 修改檔案: nfc-generator-bilingual.html
- 影響範圍: 雙語版個人版面 GPS 座標功能
- 相關任務: Task 1.1 (單語生成器座標精度限制)
