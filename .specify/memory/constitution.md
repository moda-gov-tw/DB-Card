# NFC 數位名片系統 - 專案憲章

## 專案特性
- **類型**: 純前端 NFC 數位名片系統 v2.2.0
- **架構**: 隱私優先設計，無後端追蹤
- **安全**: DOMPurify 3.2.4 + SecurityUtils 多層防護
- **容量**: NFC 492 bytes 限制優化，組織地圖連結整合，legacy payload 相容性

## 核心原則
1. **隱私優先**: 資料僅儲存於 NFC 卡片
2. **安全防護**: XSS 防護、URL 驗證、惡意資料過濾、地圖白名單
3. **容量優化**: Google Maps ID + 自訂標籤，組織地圖連結整合，向下相容性
4. **向下相容**: 支援舊版本資料格式，智慧優先順序處理，legacy encodeURIComponent 格式

## 技術約束
- 純前端架構，無後端依賴
- 支援雙語切換（中英文）
- 高齡友善設計
- 跨平台相容（Android/iOS）
- 地址格式: Google Maps ID > GPS 座標 > 文字地址
- 組織整合: 組織名稱地圖連結化，智慧去重顯示，雙重功能
- 相容性: legacy compact payload 百分比解碼 fallback
