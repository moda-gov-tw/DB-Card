# CHECKPOINTS - 專案檢查點

## location-complete-2025-10-23

### 完成狀態
- ✅ Location Object 資料結構實作
- ✅ 編碼/解碼函式擴充 (12 欄位格式)
- ✅ vCard GEO 屬性生成
- ✅ 雙語展示頁 location.label 支援
- ✅ 生成器座標輸入 UI (單語/雙語)
- ✅ 單語展示頁 location 解析與地圖連結
- ✅ MAP_BASE_URL 常數與地圖連結生成
- ✅ 安全配置擴充 (地圖網域白名單)
- ✅ UTF-8 編碼安全強化
- ✅ 社群連結注入防護

### 技術債務
- 建議單元測試 SecurityUtils.base64Encode/Decode
- 考慮社群連結正規化映射統一
- 瀏覽器自動化檢查剪貼簿/下載流程

### 回滾點
```bash
git checkout -- assets/security-utils.js assets/bilingual-common.js nfc-generator.html nfc-generator-bilingual.html index-personal.html index-personal-en.html
```

### 檔案變更
- `assets/bilingual-common.js`: MAP_BASE_URL + generateMapLink + 安全強化
- `assets/security-utils.js`: 地圖網域白名單 + UTF-8 編碼
- `nfc-generator.html`: 座標輸入 UI + 安全整合
- `nfc-generator-bilingual.html`: 雙語座標輸入 + 驗證
- `index-personal.html/en.html`: location 解析 + 地圖連結
- `progress.md`: 更新至 v2.1.5 狀態
