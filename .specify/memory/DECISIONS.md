# DECISIONS Log

## 2025-10-24 個人版生成器欄位優化 [CLOSED]
**決策**: 個人版生成器僅保留中英文姓名為必填，其餘欄位改為可選填
**狀態**: CLOSED
**影響檔案**: nfc-generator-bilingual.html
**關鍵變更**:
- 個人版切換時僅保留中英文姓名為必填
- UI 星號同步透過 toggleRequiredIndicator 顯示/隱藏
- setFieldRequired 動態處理 required 屬性
- 驗證提示訊息區分個人版與機關版

**驗收標準**: ✅ 個人版僅填姓名可生成、✅ 機關版必填規則維持、✅ UI 提示正確
**回滾方案**: git checkout HEAD -- nfc-generator-bilingual.html

## 2025-10-24 legacy compact payload 相容性修復 [CLOSED]
**決策**: 新增百分比解碼 fallback 支援舊版 encodeURIComponent 格式
**狀態**: CLOSED
**影響檔案**: assets/bilingual-common.js
**關鍵變更**:
- decodeCompact 新增百分比解碼 fallback (line 354)
- 僅在找不到 | 但偵測到 % 時採用
- 需產出 ≥ 8 欄確保是 legacy 資料
- 適用所有載入 bilingual-common.js 的雙語版頁面

**驗收標準**: ✅ 舊連結姓名正常顯示、✅ 語言切換正確、✅ vCard 匯出正確
**回滾方案**: 移除 assets/bilingual-common.js line 354 百分比解碼邏輯

## 2025-10-23 分支合併完成 [CLOSED]
**決策**: 將「名片地址優化」分支合併到主分支，完成開發
**狀態**: CLOSED
**影響檔案**: 38 files changed, 8870 insertions(+), 589 deletions(-)
**關鍵變更**:
- 成功合併「名片地址優化」分支到 main
- Fast-forward 合併，無衝突
- 推送更新到遠端 origin/main (bebbd2e..b4081f5)
- 完成 v2.2.0 版本開發

**驗收標準**: ✅ 合併成功、✅ 推送完成、✅ 無衝突、✅ 遠端同步
**回滾方案**: git reset --hard bebbd2e 回到合併前狀態

## 2025-10-23 .gitignore 更新 [CLOSED]
**決策**: 在 .gitignore 中添加 tests/ 目錄排除規則
**狀態**: CLOSED
**影響檔案**: .gitignore
**關鍵變更**:
- 添加 tests/ 目錄排除規則
- 添加 "# Test files" 註解說明
- 避免測試檔案被版本控制追蹤

**驗收標準**: ✅ .gitignore 語法正確、✅ 規則生效、✅ 格式一致
**回滾方案**: 移除 .gitignore 第 27-28 行

## 2025-10-23 單語個人版欄位重新設計 [CLOSED]
**決策**: 統一所有個人版本的欄位排序為 Name → Title → Organization → Department
**狀態**: CLOSED
**影響檔案**: index-personal.html, index-personal-en.html
**關鍵變更**:
- 欄位順序調整: Department → Name → Title → Organization 改為 Name → Title → Organization → Department
- 設計一致性: 與雙語版保持完全一致的欄位順序
- 視覺層次統一: 所有個人版本視覺層次統一
- HTML 結構優化: DOM 元素順序調整

**驗收標準**: ✅ 欄位順序統一、✅ 設計邏輯一致、✅ 視覺層次統一
**回滾方案**: git checkout HEAD 還原兩個 HTML 檔案

## 2025-10-23 個人版雙語欄位重新設計 [CLOSED]
**決策**: 重新設計個人版雙語版組織名稱與部門欄位的排序排版
**狀態**: CLOSED
**影響檔案**: index-bilingual-personal.html, assets/high-accessibility.css
**關鍵變更**:
- 欄位順序調整: Department → Name → Title → Organization 改為 Name → Title → Organization → Department
- 視覺層次優化: 字體大小和字重遞減設計
- 雙語一致性: 中英文版本樣式完全統一
- 間距調整: Department margin-bottom 從 8px 調整為 35px

**驗收標準**: ✅ 欄位順序邏輯清晰、✅ 視覺層次分明、✅ 雙語切換一致
**回滾方案**: git checkout HEAD 還原兩個檔案

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

## 2025-12-19 CodeQL 安全修復完成 [CLOSED]
**決策**: 修復 3 個 CodeQL js/client-side-unvalidated-url-redirection 漏洞
**狀態**: CLOSED
**影響檔案**: index-personal.html, index-personal-en.html, assets/bilingual-common.js
**關鍵變更**:
- index-personal.html:764 - 新增地圖 URL fallback 驗證
- index-personal-en.html:764 - 同步英文版安全修復
- assets/bilingual-common.js:247 - 強化 data URL 驗證 (2MB限制+base64檢查)
- assets/security-utils.js - 擴充 ALLOWED_SOCIAL_DOMAINS 白名單

**驗收標準**: ✅ CodeQL 漏洞修復、✅ 功能不受影響、✅ 安全性提升
**回滾方案**: git checkout HEAD 還原修改檔案

## 2025-12-19 CodeQL 安全強化與風險處理完成 [CLOSED]
**決策**: 徹底解決 CodeQL URL 重定向漏洞並處理潛在風險
**狀態**: CLOSED
**影響檔案**: index-personal.html, index-personal-en.html, assets/bilingual-common.js
**關鍵變更**:
- 移除所有不安全的 URL 賦值 fallback
- 強制使用 SecurityUtils 進行 URL 驗證
- 添加用戶友好的錯誤處理機制
- 實施優雅降級策略（禁用狀態而非失效）
- 添加 SecurityUtils 載入驗證和 Console 警告
- 支援無障礙設計（aria-disabled 屬性）

**安全提升**:
- 徹底消除 CodeQL js/client-side-unvalidated-url-redirection 警告
- 無不安全 fallback 路徑
- 強制安全驗證機制

**用戶體驗**:
- 載入失敗時提供視覺反饋
- 工具提示說明問題原因
- 保持頁面結構完整性

**驗收標準**: ✅ CodeQL 漏洞完全修復、✅ 用戶體驗優雅降級、✅ 安全性最大化
**回滾方案**: git checkout HEAD~1 還原至前一版本
