## 當前狀態
✅ **專案**: NFC 數位名片系統 v2.1.5
✅ **最新完成**: Location 設計完整實作 - 生成器 UI + 展示頁 + 安全強化
✅ **歸檔**: context/archive/location-complete-2025-10-23/

## 已完成任務 - 個人版地址座標重構 (2025-10-23)
✅ **Location Object 實作**: 新增 location{coords, label} 結構化資料
✅ **編碼優化**: decodeCompact/encodeCompact 支援座標序列化
✅ **vCard GEO 屬性**: generateBilingualVCard 使用標準 GEO 格式
✅ **顯示邏輯**: renderPersonalCard 優先讀取 location.label
✅ **安全強化**: 語言偏好集中化、頭像白名單、DOM 事件監聽器
✅ **向下相容**: 支援舊版 address 欄位回退機制

## 解決的問題
- 🗺️ **容量優化**: 座標格式取代長地址文字，降低 NFC 容量使用
- 📍 **結構化資料**: Location Object 提供 coords{lat,lng} + label 完整資訊
- 🔄 **相容性**: 新舊資料格式並存，平滑遷移
- 🛡️ **安全提升**: localStorage 包裝、頭像白名單、電子郵件驗證

## 技術實作
- **資料層**: 12 欄位格式支援，parseLocation/serializeLocation 函式
- **展示層**: location.label 雙語顯示，GEO 屬性 vCard 生成
- **安全層**: SecurityUtils 整合，白名單驗證，事件監聽器

---
**歷史任務已歸檔至**: `context/archive/qr-avatar-fixes-2025-10-14/progress-snapshot.md`
