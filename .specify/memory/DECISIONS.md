# DECISIONS - 個人版地址座標重構

## CLOSE - 2025-10-23

### 決策摘要
- **採用 Location Object 模式**: `{coords: {lat, lng}, label: string}` 結構化資料
- **12 欄位編碼格式**: 擴充 compact 格式支援座標序列化
- **vCard GEO 屬性**: 使用標準 GEO 格式取代冗長地址文字
- **向下相容策略**: 保留 address 欄位回退機制

### 技術決策
1. **資料層**: parseLocation/serializeLocation 函式處理座標與標籤
2. **展示層**: renderPersonalCard 優先讀取 location.label
3. **安全層**: 集中化語言偏好、頭像白名單、DOM 事件監聽器

### 實作結果
- 容量優化：座標格式降低 NFC 使用量
- 結構化資料：完整位置資訊支援
- 安全強化：SecurityUtils 整合與驗證
