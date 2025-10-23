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

### 狀態
✅ **已完成** (2025-10-23)

### 後續建議
- 新增回歸測試覆蓋 mapId/座標分支
- 手動測試生成器→名片完整流程
- 監控 Google Maps ID 有效期限與穩定性
