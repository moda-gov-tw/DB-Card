# DECISIONS Log

## 2025-10-23 README 版本歷程補充 [CLOSED]
**決策**: 補充 README.md 中從 v2.1.3 到 v2.2.0 的版本更新說明
**狀態**: CLOSED
**影響檔案**: README.md
**關鍵變更**:
- 補充 v2.1.4-v2.1.9 版本更新說明
- 確保版本歷程完整連續性
- 統一版本條目格式和結構
- 涵蓋地圖整合、視覺優化等功能演進

**驗收標準**: ✅ 版本號順序正確、✅ 功能描述完整、✅ 格式一致性
**回滾方案**: git checkout HEAD -- README.md

## 2025-10-23 專案文件更新 [CLOSED]
**決策**: 基於分支變更歷程更新 .gitignore 和 README.md
**狀態**: CLOSED
**影響檔案**: .gitignore, README.md
**關鍵變更**:
- .gitignore: 添加備份檔案排除規則 (*.bak, *.backup, *_backup.*, *~.nib)
- README.md: 更新版本歷程至 v2.2.0，包含 6 個主要功能
- 基於實際提交歷程: 882504a~5384026

**驗收標準**: ✅ .gitignore 語法正確、✅ README 格式一致、✅ 版本資訊準確
**回滾方案**: git checkout HEAD 或 git restore

## 2025-10-23 視覺改善任務 [CLOSED]
**決策**: 個人版展示頁部門欄位視覺層次優化
**狀態**: CLOSED
**影響檔案**: index-personal.html, index-personal-en.html, index-bilingual-personal.html, assets/high-accessibility.css
**關鍵變更**:
- 部門欄位顏色: #6c757d → #6868ac (品牌主色)
- 字重強化: 400 → 600
- 間距優化: 12px → 8px
- 響應式同步調整

**驗收標準**: ✅ 三版本一致性、✅ 視覺層次清晰、✅ 響應式相容
**回滾方案**: .bak 備份檔案或 git revert
