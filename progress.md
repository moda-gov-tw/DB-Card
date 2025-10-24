## 當前狀態
✅ **專案**: NFC 數位名片系統 v2.2.0
✅ **最新完成**: 開發完成，成功合併到主分支
✅ **歸檔**: context/archive/branch-merge-2025-10-23/

## Hotfix - legacy compact payload 相容性修復 (2025-10-24)
✅ **問題來源**: 舊版在 base64 前先 `encodeURIComponent`，導致欄位分隔符號變成 `%7C`，v2.2.0 解析不到 `|`，姓名顯示為 `%E9%99%B3...`。
✅ **修復方案**: `assets/bilingual-common.js:354` 新增百分比解碼 fallback，僅在找不到 `|` 但偵測到 `%` 時採用，且需產出 ≥ 8 欄確保是 legacy 資料。
✅ **適用範圍**: 所有載入 `bilingual-common.js` 的雙語版頁面（雙語主頁、雙語個人版、生成器）均恢復舊資料解析支援。
✅ **測試紀錄**:
  - 以 `index-bilingual-personal.html` 載入 <https://db-card.pages.dev/index-bilingual-personal?...> 舊連結，姓名/職稱恢復正常。
  - 語言切換按鈕往返測試，雙語欄位與問候語皆正確更新。
  - 於瀏覽器 console 透過 `decodeCompact`/`generateBilingualVCard` 檢查，匯出的 vCard 中文/英文版本均帶正確姓名與問候語。

## 已完成任務 - 單語個人版欄位排序重新設計 (2025-10-23)
✅ **欄位順序調整**: 將單語個人版欄位順序改為 Name → Title → Organization → Department
✅ **雙版本同步**: 中文版 (index-personal.html) 與英文版 (index-personal-en.html) 同步調整
✅ **視覺層次一致**: 確保與雙語版設計邏輯一致，維持統一視覺層次
✅ **HTML 結構優化**: 調整 DOM 元素順序，從原本 Department → Name → Title → Organization 改為 Name → Title → Organization → Department

## 解決的問題
- 📋 **設計一致性**: 單語版與雙語版欄位順序統一，提升產品一致性
- 🎯 **資訊層次**: 姓名優先顯示符合使用者認知習慣
- 👁️ **視覺引導**: 職稱 → 組織 → 部門的層次結構更清晰
- 📱 **使用者體驗**: 更直覺的資訊排列順序

## 技術調整
### HTML 結構
- 調整元素順序 (lines 489-492):
  - **原順序**: Department → Name → Title → Organization
  - **新順序**: Name → Title → Organization → Department
- 同步調整兩個版本檔案:
  - `index-personal.html` (中文版)
  - `index-personal-en.html` (英文版)

### 測試建議
- ✅ **視覺驗證**: 確認單語版欄位顯示順序正確
- ✅ **響應式測試**: 驗證行動裝置版面正常
- ✅ **一致性檢查**: 對比雙語版確認視覺層次統一

## 變更檔案清單
- ✅ `index-personal.html` (lines 489-492) - HTML 結構調整
- ✅ `index-personal-en.html` (lines 489-492) - HTML 結構調整
- ✅ `progress.md` - 更新 STM 記錄本次任務

---
## 歷史任務 - README.md 版本歷程補充 (2025-10-23)
✅ **版本歷程完整性**: 補充 v2.1.4 至 v2.1.9 版本更新說明
✅ **Git 歷史分析**: 基於 commit history 整理功能演進
✅ **版本分類**: 按功能主題分類（安全升級、授權、資料遷移、優化、位置功能）
✅ **文件一致性**: 確保版本歷程連續且完整

## 補充版本內容
- **v2.1.9**: 位置物件完整實作版（Location Object）
- **v2.1.8**: 大頭貼與 QR 碼優化版（空值處理、容量修復）
- **v2.1.7**: 個人版一致性修復版（頁面標題、vCard ORG 欄位）
- **v2.1.6**: 資料遷移版（20251007 資料重組）
- **v2.1.5**: 授權聲明完善版（第三方元件授權說明）
- **v2.1.4**: DOMPurify 安全升級版（修復 4 個嚴重漏洞）

## 解決的問題
- 📋 **版本歷程斷層**: 原本從 v2.1.3 直接跳到 v2.2.0，現已補齊中間版本
- 🎯 **功能追蹤**: 完整記錄地圖整合、自訂標籤、智慧去重等功能演進
- 📚 **文件完整性**: 確保所有重要更新都有對應版本記錄
- 🔒 **安全透明度**: 明確記錄 DOMPurify 升級與 CVE 修復

## 技術調整
### 版本歷程結構
- 採用統一格式：版本號 (日期) - 版本主題
- 使用 ✅ 標記完成功能
- **粗體**標記關鍵功能名稱
- 縮排列出 CVE 漏洞編號與嚴重性

### 版本分類依據
- Git commit message 分析
- 功能主題歸納（安全、優化、修復、新功能）
- 時間序列排列（2025-10 / 2025-09）

## 變更檔案清單
- ✅ `README.md` - 新增 v2.1.4-v2.1.9 版本歷程段落
- ✅ `progress.md` - 更新 STM 記錄本次任務

---
**前次任務已歸檔**: 個人版展示頁部門欄位視覺層次優化 (2025-10-23)
✅ **HTML 結構調整**: 將部門欄位移到姓名上方顯示
✅ **CSS 視覺優化**: 部門欄位視覺層次強化（顏色、字重、間距）
✅ **三版本同步**: 單語中文版、單語英文版、雙語版同步調整
✅ **響應式優化**: 移動端部門欄位樣式同步優化
✅ **顯示順序**: 部門 → 姓名 → 職稱 → 組織名稱

## 解決的問題
- 📋 **資訊層級**: 部門資訊作為上級分類，放在姓名上方更符合邏輯
- 🎨 **視覺層次**: 改善資訊展示的視覺層次結構，部門欄位採用品牌色 #6868ac
- 👁️ **視覺強化**: 部門欄位字重增至 600，提升視覺辨識度
- 📏 **間距優化**: 部門與姓名間距優化至 8px，層次更分明
- 📱 **使用者體驗**: 更直覺的資訊排列順序與視覺引導

## 技術調整
### HTML 結構
- 調整元素順序，部門欄位移到頭像下方、姓名上方
- 三個版本檔案同步調整：
  - `index-personal.html` (中文版)
  - `index-personal-en.html` (英文版)
  - `index-bilingual-personal.html` (雙語版)

### CSS 樣式優化
- **顏色調整**: `#6c757d` → `#6868ac` (品牌主色)
- **字重強化**: `font-weight: 400` → `600`
- **間距優化**: `margin-bottom: 12px` → `8px`
- **響應式調整**:
  - 480px 以下: `font-size: 1.1em`, `font-weight: 600`
  - 雙語版 480px 以下: `font-size: 1.15em`, `font-weight: 600`

### 高齡友善優化 (high-accessibility.css)
- 中文版部門欄位: `font-size: 1.3em`, `font-weight: 600`, `color: #6868ac`
- 英文版部門欄位: `font-size: 1.3em`, `font-weight: 600`, `color: #6868ac`
- 字重與顏色統一，提升可讀性

## 變更檔案清單
- ✅ `index-personal.html` - HTML 結構與 CSS 樣式
- ✅ `index-personal-en.html` - HTML 結構與 CSS 樣式
- ✅ `index-bilingual-personal.html` - HTML 結構與 CSS 樣式
- ✅ `assets/high-accessibility.css` - 雙語版高齡友善樣式

---
**歷史任務已歸檔至**: `context/archive/vcard-complete-2025-10-23/progress-snapshot.md`
