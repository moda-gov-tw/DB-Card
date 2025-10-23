# Short-Term Memory (STM)

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
