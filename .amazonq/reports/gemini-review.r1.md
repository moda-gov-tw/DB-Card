Data collection is disabled.
好的，我將扮演嚴格代碼審查者的角色。

由於沒有具體的程式碼變更可供審查，我將根據您提供的檔案上下文（特別是 `弱點修補任務清單.md` 和 `弱點修補技術架構.md`）以及專案結構，推斷出一個潛在且關鍵的風險點進行審查。

我將聚焦於客戶端 HTML 檔案中常見的跨網站指令碼（XSS）漏洞，這通常是此類專案的最高風險之一。我假設修補任務涉及對動態內容（例如從 URL 參數讀取的內容）的淨化處理。

---

### **代碼審查報告**

#### **1) 嚴重性評級與理由**

*   **High (高)**
*   **理由**: 專案中的多個 HTML 檔案疑似直接將從 URL 參數獲取的未淨化資料動態寫入 DOM，極易受到反射型 XSS 攻擊。攻擊者可構造惡意連結，在使用者瀏覽器中執行任意腳本，可能導致會話劫持、釣魚攻擊或植入惡意軟體。此風險直接威脅使用者安全與資料完整性。

#### **2) 受影響檔案與風險來源**

*   **風險來源**: 資安 (Security)
*   **受影響檔案**:
    *   `index.html`
    *   `index-bilingual.html`
    *   `index-personal.html`
    *   (以及其他所有從 URL 動態生成 vCard 或 QR Code 的相關 HTML 檔案)
*   **詳細說明**: 這些檔案中的 JavaScript 程式碼透過 `URLSearchParams` 讀取查詢參數（如 `name`, `tel`, `email` 等），並可能在未經嚴格過濾的情況下，使用 `.innerHTML` 或類似方法將其呈現在頁面上。這是典型的 XSS 漏洞（CWE-79）。

#### **3) 修復建議與驗證步驟**

**修復建議 (最小變更原則)**

我建議在將任何外部輸入（特別是 URL 參數）插入 DOM 之前，強制使用 `DOMPurify` 進行淨化。專案中已包含 `dompurify.min.js`，應充分利用。

以下是一個針對性的修復範例，假設原始程式碼如下：

```javascript
// Vulnerable Code
const params = new URLSearchParams(window.location.search);
const name = params.get('name');
document.getElementById('name-display').innerHTML = name; // XSS vulnerability here
```

建議修復為：

```diff
--- a/index.html
+++ b/index.html
@@ -100,4 +100,4 @@
 const params = new URLSearchParams(window.location.search);
 const name = params.get('name');
-document.getElementById('name-display').innerHTML = name;
+document.getElementById('name-display').textContent = name; // Use textContent for simple text
+// OR if HTML is needed:
+// document.getElementById('name-display').innerHTML = DOMPurify.sanitize(name);

```

**通用修復原則**:
1.  對於不需要呈現 HTML 標籤的內容，一律使用 `.textContent` 而非 `.innerHTML`。這是最簡單且最安全的防禦。
2.  若內容必須包含 HTML（例如，URL 參數中包含需呈現的換行 ` <br> `），則必須使用 `DOMPurify.sanitize()` 進行處理。
3.  在 `assets/security-utils.js` 中建立一個輔助函數，封裝淨化邏輯，以確保所有開發人員都能一致地調用。

```javascript
// In assets/security-utils.js
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input);
}
```

**驗證步驟**:
1.  **單元測試**: 開啟 `tests/test-dompurify-integration.html` 或 `tests/test-security-comprehensive.html`。
2.  **手動驗證**: 在瀏覽器中開啟任一受影響的 HTML 檔案，並在 URL 後附加惡意腳本作為參數，例如：
    `.../index.html?name=<img src=x onerror=alert('XSS')>`
3.  **預期結果**:
    *   **修復前**: 瀏覽器會彈出一個包含 "XSS" 字樣的警告框。
    *   **修復後**: 警告框不應出現。頁面上應顯示無害的純文字 ` <img src=x> ` 或完全不顯示該圖片標籤。

#### **4) Security**

此變更直接解決了 CWE-79（不當的中和輸入於網頁生成）。透過確保所有使用者提供的內容在寫入 DOM 前都經過淨化，可以有效防禦反射型 XSS 攻擊，顯著提升應用程式的安全性。

#### **5) Accessibility**

此修復對可及性（Accessibility）沒有負面影響。若惡意腳本被執行，反而可能透過 DOM 操作破壞頁面結構，降低可及性。因此，防禦 XSS 有助於維持一個穩定、可預測的無障礙網頁環境。

#### **6) 建議提交訊息**

```
feat(security): Sanitize URL parameters to prevent XSS

Refactor dynamic content rendering to mitigate reflected Cross-Site Scripting (XSS) vulnerabilities. All data retrieved from URL search parameters is now processed before being inserted into the DOM.

- Use `textContent` instead of `innerHTML` for inserting plain text content.
- Apply `DOMPurify.sanitize()` for any input that may legitimately contain HTML markup.

This change hardens the application against malicious link attacks, protecting user data and session integrity.
```
