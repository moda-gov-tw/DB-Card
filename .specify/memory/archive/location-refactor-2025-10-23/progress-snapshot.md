# 個人版地址座標重構 - 完成快照 (2025-10-23)

## 任務完成摘要
✅ **Location Object 實作**: 新增 location{coords, label} 結構化資料
✅ **編碼優化**: decodeCompact/encodeCompact 支援座標序列化  
✅ **vCard GEO 屬性**: generateBilingualVCard 使用標準 GEO 格式
✅ **顯示邏輯**: renderPersonalCard 優先讀取 location.label
✅ **安全強化**: 語言偏好集中化、頭像白名單、DOM 事件監聽器
✅ **向下相容**: 支援舊版 address 欄位回退機制

## 技術實作細節
- **資料層**: 12 欄位格式支援，parseLocation/serializeLocation 函式
- **展示層**: location.label 雙語顯示，GEO 屬性 vCard 生成  
- **安全層**: SecurityUtils 整合，白名單驗證，事件監聽器

## 解決的核心問題
- 🗺️ **容量優化**: 座標格式取代長地址文字，降低 NFC 容量使用
- 📍 **結構化資料**: Location Object 提供完整位置資訊
- 🔄 **相容性**: 新舊資料格式並存，平滑遷移
- 🛡️ **安全提升**: localStorage 包裝、頭像白名單、電子郵件驗證

## 檔案變更記錄
- `assets/bilingual-common.js`: Location Object 編碼解碼 + 安全強化
- `index-bilingual-personal.html`: location.label 顯示邏輯 + DOM 監聽器
- `progress.md`: 更新專案狀態至 v2.1.4

## 歸檔時間
2025-10-23T11:44:06.656+08:00
