# CHECKPOINTS - 專案檢查點

## location-refactor-2025-10-23

### 完成狀態
- ✅ Location Object 資料結構實作
- ✅ 編碼/解碼函式擴充 (12 欄位格式)
- ✅ vCard GEO 屬性生成
- ✅ 顯示邏輯更新 (location.label 優先)
- ✅ 安全強化 (語言偏好、頭像白名單、DOM 監聽器)

### 技術債務
- 建議瀏覽器煙霧測試
- 考慮 CSP 'unsafe-inline' 淘汰

### 回滾點
```bash
git checkout -- assets/bilingual-common.js index-bilingual-personal.html
```

### 檔案變更
- `assets/bilingual-common.js`: 新增 parseLocation/serializeLocation + 安全強化
- `index-bilingual-personal.html`: location.label 顯示 + DOM 事件監聽器
- `progress.md`: 更新至 v2.1.4 狀態
