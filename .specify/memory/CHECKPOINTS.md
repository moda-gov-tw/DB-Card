# CHECKPOINTS Manifest

## hotfix-legacy-compatibility-2025-10-24
**時間**: 2025-10-24T11:48:25+08:00
**版本**: v2.2.0
**類型**: Hotfix 與生成器優化
**狀態**: COMPLETED

### 變更摘要
- 修復舊版 encodeURIComponent 格式相容性問題
- 個人版生成器欄位降為選填，僅保留中英文姓名必填
- 單語個人版欄位排序統一設計
- 提升 v2.2.0 版本穩定性與使用者體驗

### 檔案清單
- assets/bilingual-common.js (百分比解碼 fallback)
- nfc-generator-bilingual.html (個人版欄位優化)
- index-personal.html, index-personal-en.html (欄位排序統一)
- progress.md (狀態更新)

### DocOps Hash
- STM: progress.md#hotfix-legacy-compatibility-complete
- LTM: .specify/memory/DECISIONS.md#2025-10-24-hotfix-closed

## branch-merge-2025-10-23
**時間**: 2025-10-23T19:45:55+08:00
**版本**: v2.2.0
**類型**: 開發完成分支合併
**狀態**: COMPLETED

### 變更摘要
- 成功將「名片地址優化」分支合併到主分支
- Fast-forward 合併，無衝突
- 推送更新到遠端 origin/main (bebbd2e..b4081f5)
- 完成 v2.2.0 版本開發

### 檔案清單
- 38 files changed, 8870 insertions(+), 589 deletions(-)
- 包含所有開發期間的功能更新
- progress.md (狀態更新)

### DocOps Hash
- STM: progress.md#branch-merge-complete
- LTM: .specify/memory/DECISIONS.md#2025-10-23-merge-closed

## gitignore-update-2025-10-23
**時間**: 2025-10-23T19:41:53+08:00
**版本**: v2.2.0
**類型**: .gitignore 配置更新
**狀態**: COMPLETED

### 變更摘要
- 在 .gitignore 中添加 tests/ 目錄排除規則
- 添加 "# Test files" 註解說明
- 避免測試檔案被版本控制追蹤
- 保持配置檔案格式一致性

### 檔案清單
- .gitignore (添加 tests/ 排除規則)
- progress.md (狀態更新)

### DocOps Hash
- STM: progress.md#gitignore-update-complete
- LTM: .specify/memory/DECISIONS.md#2025-10-23-gitignore-closed

## personal-field-unification-2025-10-23
**時間**: 2025-10-23T19:36:45+08:00
**版本**: v2.2.0
**類型**: 單語個人版欄位統一設計
**狀態**: COMPLETED

### 變更摘要
- 統一所有個人版本的欄位排序為 Name → Title → Organization → Department
- 單語中文版和英文版欄位順序調整
- 與雙語版保持完全一致的設計邏輯
- 基於 DDD 資訊架構原則的視覺層次

### 檔案清單
- index-personal.html (單語中文版欄位順序調整)
- index-personal-en.html (單語英文版欄位順序調整)
- progress.md (狀態更新)

### DocOps Hash
- STM: progress.md#personal-field-unification-complete
- LTM: .specify/memory/DECISIONS.md#2025-10-23-personal-unification-closed

## bilingual-field-redesign-2025-10-23
**時間**: 2025-10-23T19:28:25+08:00
**版本**: v2.2.0
**類型**: 個人版雙語欄位重新設計
**狀態**: COMPLETED

### 變更摘要
- 重新設計個人版雙語版組織名稱與部門欄位排序排版
- 欄位順序調整: Name → Title → Organization → Department
- 視覺層次優化: 字體大小和字重遞減設計
- 雙語一致性: 中英文版本樣式完全統一

### 檔案清單
- index-bilingual-personal.html (欄位順序重新設計)
- assets/high-accessibility.css (雙語視覺層次優化)
- progress.md (狀態更新)

### DocOps Hash
- STM: progress.md#bilingual-field-redesign-complete
- LTM: .specify/memory/DECISIONS.md#2025-10-23-bilingual-closed

## version-history-2025-10-23
**時間**: 2025-10-23T19:20:19+08:00
**版本**: v2.2.0
**類型**: README 版本歷程補充
**狀態**: COMPLETED

### 變更摘要
- 補充 README.md 中從 v2.1.3 到 v2.2.0 的版本更新說明
- 添加 v2.1.4-v2.1.9 版本歷程條目
- 確保版本演進完整連續性
- 統一版本條目格式和結構

### 檔案清單
- README.md (版本歷程補充)
- progress.md (狀態更新)

### DocOps Hash
- STM: progress.md#version-history-complete
- LTM: .specify/memory/DECISIONS.md#2025-10-23-readme-closed

## docs-update-2025-10-23
**時間**: 2025-10-23T19:14:55+08:00
**版本**: v2.2.0
**類型**: 專案文件更新
**狀態**: COMPLETED

### 變更摘要
- 基於分支變更歷程更新專案文件
- .gitignore 添加備份檔案排除規則
- README.md 更新版本歷程至 v2.2.0
- 包含 6 個主要功能說明

### 檔案清單
- .gitignore (備份檔案排除規則)
- README.md (版本歷程更新)
- progress.md (狀態更新)

### DocOps Hash
- STM: progress.md#docs-update-complete
- LTM: .specify/memory/DECISIONS.md#2025-10-23-docs-closed

## visual-enhancement-2025-10-23
**時間**: 2025-10-23T18:59:55+08:00
**版本**: v2.2.0
**類型**: 視覺改善優化
**狀態**: COMPLETED

### 變更摘要
- 個人版展示頁部門欄位視覺層次優化
- 部門欄位品牌色 #6868ac + 字重 600 + 間距 8px
- 三版本同步調整保持一致性
- 響應式布局完全相容

### 檔案清單
- index-personal.html (HTML結構+CSS樣式)
- index-personal-en.html (HTML結構+CSS樣式)  
- index-bilingual-personal.html (HTML結構+CSS樣式)
- assets/high-accessibility.css (視覺層次強化)
- progress.md (狀態更新)

### DocOps Hash
- STM: progress.md#visual-enhancement-complete
- LTM: .specify/memory/DECISIONS.md#2025-10-23-closed
