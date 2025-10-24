# Legacy Compact Payload Compatibility (2025-10-24)

## 背景
- 早期版本的 NFC 名片資料在做 base64 編碼前，先對整段字串進行 `encodeURIComponent`，因此欄位分隔符號 `|` 及雙語分隔 `~` 會被轉成 `%7C` 與 `%7E`。
- v2.2.0 起的程式碼假設 base64 解碼後可以直接 `split('|')`，沒有額外處理百分比編碼。
- 在新版本頁面上打開舊資料時，整串 payload 會被視為單一欄位，導致姓名顯示成 `%E9%99%B3%E4%BA%BA%E7%A6%BE` 等未解碼字串。

## 問題重現
- 測試網址：<https://db-card.pages.dev/index-bilingual-personal?data=JUU5JTk5JUIzJUU0JUJBJUJBJUU3JUE2JUJFfkNoZW4lMjBKZW4lMjBIbyU3QyVFNyVCNiU5MyVFNyU5MCU4Nn5NYW5hZ2VyJTdDJUU1JUJFJUI3JUU2JTk2JUIwJUU1JTgyJUEyJUU1JTg1JUI3KCVFOSVCRSU5QyVFNSVCMSVCMSVFNSVCQSU5NyklN0MwOTI1OTkyMzk5JTdDMDMtMzU5MDc5OSU3QzA5MjU5OTIzOTklN0MlN0MlRTYlQUQlQTElRTglQkYlOEUlRTglQUElOEQlRTglQUQlOTglRTYlODglOTElRUYlQkMlODF-TmljZSUyMHRvJTIwbWVldCUyMHlvdSElN0M>
- base64 解碼後得到 `%E9%99%B3%E4%BA%BA%E7%A6%BE~Chen%20Jen%20Ho%7C...`，未做百分比解碼。
- 由於字串中沒有實體 `|`，`decodeCompact` 判定為 1 個欄位，該欄位再依據雙語處理流程顯示出未解碼的 `%` 字串。

## 影響
- 所有舊發行（向後相容至 v2.1.x）的個人版/雙語個人版資料都會顯示錯亂。
- 下載的 vCard 也會包含未解碼字串，造成通訊錄資料不正確。

## 修復策略
1. 在 `decodeCompact` 中加入 fallback：當 base64 解碼結果不含 `|` 但包含 `%` 時，嘗試對整串字串執行 `decodeURIComponent`。
2. 只有在成功解碼且產出至少 8 個欄位時才採用 fallback，以避免誤判正常含 `%` 的新資料。
3. 維持現有欄位長度判斷（8/9/11/12 欄）以支援歷史版本結構。
4. 新增簡單測試或調試腳本（可放入 `tests/`）驗證舊 payload 能正確還原姓名、職稱與聯絡資訊。
5. 於發佈說明或進度文件中標註：v2.2.0 hotfix 支援舊版百分比編碼 payload，建議使用者更新頁面。

## 待辦
- [x] 更新 `assets/bilingual-common.js` 的 `decodeCompact`，實作上述 fallback。
- [ ] 加入測試資料驗證，確保 `encodeCompact` → `decodeCompact` 雙向操作仍符合預期。
- [ ] 更新文件（如 `progress.md` 或發佈筆記）說明此次 hotfix 內容與風險。
