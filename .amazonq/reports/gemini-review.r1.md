Data collection is disabled.
好的，這是一份根據您提供的 diff 進行的嚴格代碼審查。

### 1) 嚴重性評級與理由

**Blocking**

**理由：** 此變更集一次性修補了整個應用程式中的 31 個嚴重級別資訊安全弱點（30 個 DOM XSS 和 1 個 Open Redirect），並引入了內容安全策略（CSP）作為縱深防禦。同時，它極大地改善了無障礙性（Accessibility）並建立了一個全面的自動化安全測試框架。這些變更是發布任何新版本的**前提條件**，因此評級為「Blocking」。

### 2) 受影響檔案與風險來源

*   **`assets/security-utils.js`** (新檔案)
    *   **風險來源：** 相依性 (Dependency), 資安 (Security)
    *   **說明：** 這是新的核心安全相依項。所有安全修補的有效性都依賴此檔案的正確性。雖然它本身是為了解決風險而生，但它也成為了新的、必須被嚴格審查的單點。
*   **`assets/bilingual-common.js`**
    *   **風險來源：** 資安 (Security), 無障礙 (Accessibility)
    *   **說明：** 修補了開放重導向（Open Redirect）弱點。同時，透過正確處理無效連結的屬性（`href`, `aria-disabled`），極大提升了鍵盤與螢幕報讀器使用者的體驗。
*   **所有 `.html` 檔案**
    *   **風險來源：** 資安 (Security)
    *   **說明：**
        1.  透過引入 `security-utils.js` 並使用 `safeRender` 和 `getSecureURLParam`，修補了所有 DOM-based XSS 漏洞。
        2.  添加了 `<meta http-equiv="Content-Security-Policy">` 標頭，提供了關鍵的縱深防禦層，以防止未來的 XSS 或其他內容注入攻擊。
*   **`.gitignore`**
    *   **風險來源：** 規則 (Rules) / 異味 (Smells)
    *   **說明：** 將 `tests/` 目錄加入忽略列表是**不正確的**。自動化測試是專案品質保證的關鍵部分，必須被版本控制。
*   **`doc/*`** (新檔案)
    *   **風險來源：** 無 (正面貢獻)
    *   **說明：** 增加了極高品質的技術文件，包括弱點清單、修補任務、技術架構和相容性測試指南，顯著降低了維護成本和風險。
*   **`tests/*`** (新檔案/移動)
    *   **風險來源：** 無 (正面貢獻)
    *   **說明：** 建立了一套完整的自動化測試套件，涵蓋了單元、整合、安全和無障礙性測試，這是確保修補有效且無回歸的關鍵。

### 3) 以《最小變更原則》的修復建議與驗證步驟

此 diff 在程式碼修補方面完美地遵循了《最小變更原則》。它將所有安全邏輯抽象到一個新的 `security-utils.js` 模組中，並在受影響的檔案中以最小的侵入性進行了呼叫替換，而沒有重構現有功能邏輯。

**修復建議：**

唯一的負面變更是 `.gitignore` 檔案。測試程式碼**必須**被納入版本控制。

```patch
--- a/.gitignore
+++ b/.gitignore
@@ -17,5 +17,3 @@
 
 # Backup files
 .backups/
-
-# Test files directory
-# tests/ contains all security test scripts

```

**驗證步驟：**

1.  **自動化測試驗證：** 在瀏覽器中打開 `tests/test-security-comprehensive.html` 和 `tests/test-security-final.html`。確認所有測試案例均顯示「✅ PASS」。
2.  **XSS 手動驗證：**
    *   訪問 `index.html?data={"name":"<img src=x onerror=alert(1)>"}`。
    *   預期結果：頁面應顯示純文字 `&lt;img src=x onerror=alert(1)&gt;`，且**不得**有 alert 彈窗。
3.  **Open Redirect 手動驗證：**
    *   訪問 `index-bilingual.html?c=...`（一個包含社群連結的合法資料）。
    *   在瀏覽器開發者工具中，手動修改一個社群連結的 `href` 為 `javascript:alert('redirect')`。
    *   預期結果：點擊該連結**不得**執行 alert，且連結應已在渲染時被 `security-utils.js` 禁用。
4.  **無障礙驗證：**
    *   打開 `tests/test-accessibility.html`。
    *   預期結果：頁面報告所有測試通過。使用鍵盤 `Tab` 鍵，焦點應跳過被禁用的「Malicious」連結。
5.  **功能回歸驗證：**
    *   根據 `doc/NFC相容性測試指南.md` 中的數據，構造合法的 NFC 連結（包括精簡、完整、雙語格式），訪問頁面。
    *   預期結果：所有名片資料（姓名、職稱、頭像等）應正常顯示，vCard 下載、QR Code 生成功能正常。

### 4) 《Security》安全分析

*   **輸入驗證 (Input Validation)：** **[已修復]** `getSecureURLParam` 對 URL 參數進行了清理。`validateURL` 使用協議白名單驗證所有外部連結，有效防禦了多種惡意 URL。
*   **AuthN/AuthZ：** 不適用。
*   **Secrets Management：** 不適用。
*   **XSS/SQLi/SSRF 等注入攻擊：**
    *   **XSS：** **[已修復]**
        1.  `safeRender` 取代了所有危險的 `innerHTML` 操作，從根本上解決了 DOM XSS。其內部的 `sanitizeHTML` 雖然是基於正規表示式，但在這個靜態頁面的上下文中，對於已知的攻擊向量是足夠的。
        2.  添加了全站的 **CSP 標頭**，作為第二道防線，極大增加了攻擊者成功注入腳本的難度。
    *   **Open Redirect：** **[已修復]** `bilingual-common.js` 中的 `createSocialElement` 現在會先呼叫 `validateURL`，有效緩解了此風險。
*   **相依性風險 (Dependency Risk)：**
    *   **[已緩解]** 雖然引入了新的本地相依 `assets/security-utils.js`，但同時也為其建立了極為詳盡的測試套件 (`test-security-*.html`)，這有效地驗證了其安全性並降低了引入新漏洞的風險。

### 5) 《Accessibility》無障礙分析

*   **WAI-ARIA & 語意標籤 (Semantic Tags)：** **[優秀]** 當 `validateURL` 失敗時，不僅移除了 `href` 屬性，還正確地添加了 `aria-disabled="true"` 和 `role="link"`。這清晰地向輔助技術傳達了「這是一個連結，但目前不可用」的語意，是無障礙設計的最佳實踐。
*   **鍵盤導航 (Keyboard Navigation) & 焦點順序 (Focus Order)：** **[優秀]** 透過移除 `href` 屬性，被禁用的連結會被自動從鍵盤的 Tab 順序中移除，避免了使用者聚焦到一個無效的元件上，提供了流暢的導航體驗。
*   **對比度 & 視覺回饋：** **[良好]** 透過設定 `opacity: 0.5` 和 `pointer-events: none`，為視力正常的使用者提供了清晰的視覺禁用提示。

### 6) 建議提交訊息 (Commit Message)

```
feat(security): Implement comprehensive security hardening

This commit introduces a major security overhaul to mitigate multiple critical vulnerabilities and establish a robust defense-in-depth architecture.

- **Mitigate DOM XSS:** Replaces all unsafe `innerHTML` assignments with a centralized `safeRender` utility, effectively neutralizing 30 identified DOM-based Cross-Site Scripting vulnerabilities across all HTML pages.
- **Prevent Open Redirect:** Implements strict URL validation using a protocol whitelist for all external social links, fixing an Open Redirect vulnerability.
- **Introduce CSP:** Deploys a Content Security Policy (CSP) via meta tags on all pages as a crucial second layer of defense against content injection attacks.
- **Enhance Accessibility:** Improves accessibility by correctly marking disabled links with `aria-disabled="true"` and removing them from the keyboard focus order.
- **Add Test Suite:** Establishes a comprehensive, automated testing framework covering security vulnerabilities (XSS, URL validation, DOM Clobbering), accessibility, and feature regressions.
- **Centralize Security Logic:** Creates a new `security-utils.js` module to encapsulate all security-related functions, ensuring maintainability and consistency.
```
