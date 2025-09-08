Data collection is disabled.
好的，這是一份針對您提交的變更所做的嚴格代碼審查。

### 1) 嚴重性評級與理由

**嚴重性：** 低 (Low)

**理由：**
此變更本身是**正面**的安全性重構，並非引入新風險。它修復了兩個潛在的**高嚴重性 (High)**漏洞：
1.  **跨網站指令碼 (XSS)**：用業界標準的 `DOMPurify` 取代了自製、脆弱且容易被繞過的正規表示式 HTML 清理器。自製的清理器是典型的反模式，難以涵蓋所有攻擊向量。
2.  **開放重定向 (Open Redirect)**：在 `validateURL` 中增加了基於來源白名單的驗證，有效防禦了 CWE-601 風險，防止使用者被導向惡意網站。

由於此變更是修補而非引入問題，因此變更本身的風險評為「低」，但它解決的問題是「高」風險等級。

### 2) 受影響檔案與風險來源

*   **受影響檔案：** `assets/security-utils.js`
*   **風險來源分析 (原始代碼)：**
    *   **資安 (Security)：**
        *   原始的 `sanitizeHTML` 函式使用正規表示式進行黑名單過濾，這種方法極易被繞過（例如：使用大小寫變形、編碼字元、未考慮的標籤屬性等），存在嚴重的 XSS 風險。
        *   原始的 `validateURL` 函式未檢查 URL 的來源 (origin)，允許將使用者重定向到任何外部網站，構成開放重定向漏洞。
    *   **異味 (Code Smell)：** 原始的 `sanitizeHTML` 函式是典型的「重新發明輪子」(Reinventing the Wheel) 異味，特別是在安全性這種需要專業知識的領域。
    *   **相依性 (Dependency)：** 新的實作引入了對 `DOMPurify` 的硬性依賴。雖然程式碼中有備援機制，但若 `DOMPurify` 未能成功載入，安全等級會顯著下降。

### 3) 修復建議與驗證步驟

**修復建議：**
此變更方向正確，應予以採納。這是一次出色的安全性強化。以下是為了確保變更完整性的建議，**不需修改程式碼**，而是作為後續的驗證與補強步驟：

1.  **確認相依性載入順序：** 確保在所有使用到 `security-utils.js` 的 HTML 頁面中，`dompurify.min.js` 腳本**必定**在 `security-utils.js` 之前被載入。
2.  **強化備援機制日誌：** 在 `sanitizeHTML` 的 `else` 區塊（DOMPurify 未定義時），目前的日誌 `this.logSecurityEvent(...)` 很好，但可以考慮增加一個更醒目的控制台錯誤 `console.error`，以確保開發者在開發環境中能立即注意到這個嚴重的降級情況。

**Patch 建議 (僅供參考，強化日誌)：**
```diff
--- a/assets/security-utils.js
+++ b/assets/security-utils.js
@@ -93,6 +93,7 @@
             } else {
                 // 降級到基礎 HTML 實體編碼（如果 DOMPurify 未載入）
                 this.logSecurityEvent('sanitizeHTML', 'DOMPurify not available, using fallback', { html: html.substring(0, 50) });
+                console.error('[CRITICAL] DOMPurify library not loaded. Falling back to basic sanitization. XSS risk increased.');
                 return this.sanitizeInput(html, 'text');
             }
         },

```

**驗證步驟：**
1.  **單元測試：** 擴充 `tests/test-dompurify-integration.html` 或 `tests/test-security-comprehensive.html`，加入以下針對 `SecurityUtils.sanitizeHTML` 的測試案例：
    *   **惡意 Payload：** `<img src=x onerror=alert(1)>`, `<svg/onload=alert(1)>`, `<a href="javascript:alert(1)">Click</a>`。預期結果：所有惡意程式碼被移除。
    *   **保留內容：** `<b>bold</b> and <i>italic</i> with <a href="https://example.com">link</a>`。預期結果：標籤和內容被正確保留。
2.  **開放重定向測試：** 建立測試案例，呼叫 `SecurityUtils.setSecureAttribute` 設定一個 `<a>` 標籤的 `href`：
    *   使用惡意 URL `https://evil.com`，且 `allowedOrigins` 未包含 `https://evil.com`。預期結果：`href` 屬性被設定為安全預設值（例如 `#`）。
    *   使用合法的跨域 URL `https://trusted.com`，並將其加入 `allowedOrigins`。預期結果：`href` 被成功設定。
3.  **相依性失敗測試：** 暫時在測試頁面中移除 `dompurify.min.js` 的載入，確認 `sanitizeHTML` 會觸發備援機制，並在控制台看到對應的警告/錯誤訊息。

### 4) 《Security》安全分析

*   **輸入驗證 (Input Validation)：** **顯著增強**。從脆弱的自訂邏輯升級為經過嚴格測試的 `DOMPurify` 函式庫，大幅提升了對 HTML 輸入的驗證與清理能力。
*   **AuthN/AuthZ：** 不適用。
*   **Secrets：** 不適用。
*   **XSS/SQLi/SSRF：**
    *   **XSS：** **主要改進點**。此變更的核心是將一個高度易受攻擊的自訂清理器替換為強大的 XSS 防禦標準庫，極大降低了儲存型和反射型 XSS 的風險。
    *   **開放重定向 (Open Redirect)：** **已修復**。透過在 `validateURL` 中實作來源白名單檢查，有效封堵了此類漏洞。
*   **相依性風險 (Dependency Risk)：** **已引入**。程式碼現在依賴 `DOMPurify`。雖然有備援處理，但這是一個需要管理的依賴關係。確保函式庫的完整性（SRI, Subresource Integrity）和可用性至關重要。

### 5) 《Accessibility》無障礙分析

*   **WAI-ARIA / 語意標籤 (Semantic Tags)：** **正面影響**。舊的清理器會移除所有 `<a>` 標籤，而新實作在安全的前提下允許了 `<a>` 標籤。這對於提供上下文連結（例如「了解更多」）至關重要，能改善螢幕報讀器使用者的體驗。保留 `<strong>`, `<em>` 等語意標籤也有助於傳達語氣。
*   **鍵盤導航 (Keyboard Navigation)：** **正面影響**。允許 `<a>` 標籤的存在，使得內容中的連結可以透過鍵盤（如 Tab 鍵）進行聚焦和操作，改善了鍵盤使用者的可及性。
*   **對比度 / 焦點順序 / 螢幕報讀 (Contrast / Focus Order / Screen Reader)：** 整體為中性至正面。此變更本身不影響視覺呈現，但透過保留更豐富的語意結構，為螢幕報讀器提供了更好的朗讀體驗。

### 6) 建議提交訊息 (Commit Message)

```
security(utils): replace custom sanitizer and add open redirect defense

Replaced the fragile, custom regex-based HTML sanitizer in `sanitizeHTML` with the industry-standard DOMPurify library. This provides robust protection against XSS vulnerabilities that the previous implementation was susceptible to.

Additionally, implemented an origin-based allowlist check in `validateURL` to mitigate Open Redirect (CWE-601) vulnerabilities. This check is integrated into `setSecureAttribute` to prevent redirection to untrusted domains.

Finally, enhanced `logSecurityEvent` to include call stack information, improving debuggability for security-related events.
```
