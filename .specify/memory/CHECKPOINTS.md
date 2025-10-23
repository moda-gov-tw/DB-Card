# 專案檢查點清單

## org-map-link-2025-10-23
- **時間**: 2025-10-23T15:41:07.963+08:00
- **設計**: personal-card-location-refactor@v2.1.9
- **狀態**: ✅ 完成
- **摘要**: 組織名稱地圖連結整合 - 智慧去重與雙重功能
- **檔案**: 4 個檔案變更 (index-bilingual-personal.html, index-personal.html, index-personal-en.html, doc/personal-card-location-refactor.md)
- **功能特色**: 雙重功能整合、智慧去重邏輯、視覺一致性、安全連結生成
- **使用者體驗**: 組織名稱 = 身份識別 + 地圖導航，避免重複資訊顯示
- **DocOps**: progress.md 更新、DECISIONS.md 新增、BUNDLE_INDEX.json 更新
- **STM 雜湊**: organization-map-link-integration

## custom-label-2025-10-23 (已歸檔)
- **時間**: 2025-10-23T14:57:21.667+08:00
- **設計**: personal-card-location-refactor@v2.1.8
- **狀態**: ✅ 完成
- **摘要**: Google Maps 自訂標籤功能 - 單語/雙語版本完整支援
- **檔案**: 5 個檔案變更 (nfc-generator.html, nfc-generator-bilingual.html, index-personal.html, index-personal-en.html, index-bilingual-personal.html)
- **功能特色**: 字數限制 20 字元、即時統計、雙語支援、標籤優先顯示
- **使用者體驗**: 可自訂 Google Maps 連結顯示文字（如「辦公室」、「會議地點」）
- **DocOps**: progress.md 更新、DECISIONS.md 新增、BUNDLE_INDEX.json 更新
- **STM 雜湊**: google-maps-custom-label

## google-maps-id-2025-10-23 (已歸檔)
- **時間**: 2025-10-23T14:23:13.553+08:00
- **設計**: personal-card-location-refactor@v2.1.7
- **狀態**: ✅ 完成
- **摘要**: Google Maps ID 支援實作 - 三選一地址模式 + 容量優化
- **檔案**: 6 個檔案變更 (assets/bilingual-common.js, assets/security-utils.js, nfc-generator.html, nfc-generator-bilingual.html, index-personal.html, index-personal-en.html)
- **容量效益**: 節省 59% 容量 (17 字元 vs 42 字元)
- **安全強化**: 白名單擴充、ID 驗證、事件記錄
- **DocOps**: progress.md 更新、DECISIONS.md 建立、BUNDLE_INDEX.json 更新
- **STM 雜湊**: google-maps-id-support

## coordinate-precision-2025-10-23 (已歸檔)
- **時間**: 2025-10-23 (早期)
- **設計**: GPS 座標精簡策略
- **狀態**: ✅ 完成並歸檔
- **摘要**: 6 位小數精度限制 + 安全強化
- **歸檔路徑**: context/archive/coordinate-precision-2025-10-23/

## location-complete-2025-10-23 (已歸檔)
- **時間**: 2025-10-23 (更早期)
- **設計**: Location Object 實作
- **狀態**: ✅ 完成並歸檔
- **摘要**: 結構化座標資料與 vCard GEO 屬性
- **歸檔路徑**: context/archive/location-complete-2025-10-23/
