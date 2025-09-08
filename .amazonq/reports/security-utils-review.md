Data collection is disabled.
好的，這是一份針對 `assets/security-utils.js` 的深度安全審查報告。

---

### **《資訊安全專家審查報告：security-utils.js》**

**報告日期：** 2025年9月8日
**審查對象：** `assets/security-utils.js`
**審查人：** Gemini (模擬資訊安全專家)

#### **總體評價**

此 `security-utils.js` 模組展現了良好的安全意識，試圖透過集中式函數來應對常見的網頁安全威脅，如 XSS 和不安全的 URL 處理。包含了安全日誌、輸入清理、安全渲染等關鍵概念，這是一個正確的方向。

然而，核心實作上存在一些嚴重漏洞，特別是在 HTML 清理機制上，採用了基於規則表示式（Regex）的黑名單過濾，這種方法在面對有經驗的攻擊者時極易被繞過。目前的狀態**不足以有效防禦 DOM XSS 攻擊**。

以下是針對各個分析重點的詳細報告及修復建議。

---

#### **1. `validateURL` 函數的繞過可能性分析**

此函數使用 `new URL()` 建構子和協議白名單，這是一個相對穩健的基礎。

*   **優點：**
    *   使用瀏覽器內建的 `URL` 解析器，能正確處理各種 URL 編碼和格式，避免了手動解析的複雜性和風險。
    *   採用了 `allowedProtocols` 白名單（`http:`, `httpshttps:`, `mailto:`, `tel:`），是防止 `javascript:`, `data:`, `vbscript:` 等危險協議的最佳實踐。

*   **潛在弱點與繞過分析：**
    *   **開放重定向 (Open Redirect)：** 這是此函數最大的盲點。`validateURL` 只驗證協議，不驗證主機名稱 (hostname)。例如，一個 URL `https://evil-site.com` 會被視為有效，因為它的協議是 `https:`。如果應用程式使用此函數來驗證重定向目標 URL，就會產生開放重定向弱點，攻擊者可將使用者導向釣魚網站或惡意網站。
    *   **繞過可能性：** 對於協議本身的繞過非常困難，因為 `URL` 解析器和白名單機制很有效。攻擊的重點不在於繞過此函數，而在於利用它對「主機」的信任。

#### **2. `sanitizeInput` 的過濾機制是否完整**

此函數的目的是清理輸入，但其效果根據 `type` 參數有很大差異。

*   **優點：**
    *   對 `text`, `email`, `phone` 類型採用了剝除潛在危險字元或進行 HTML 實體編碼的策略，提供了基礎的 XSS 防護。

*   **嚴重缺陷：**
    *   **`type='url'` 的邏輯錯誤：** 程式碼先對 URL 進行 HTML 編碼 (`htmlEscape`)，然後才傳遞給 `validateURL`。例如，`https://a.com` 會變成 `https:&#x2F;&#x2F;a.com`，這將導致 `new URL()` 解析失敗，從而使**所有合法的 URL 都被判斷為無效**並返回空字串。這是一個功能性 Bug，可能導致服務阻斷 (DoS)。
    *   **`type='email'` 的不完整性：** `/[^\w@.-]/g` 的規則過於嚴格，它會過濾掉 email 地址中合法的 `+` 號（用於郵件子地址，如 `user+tag@gmail.com`），這會影響功能性。

#### **3. `safeRender` 是否存在 DOM XSS 風險**

此函數是**最關鍵的風險點**。

*   **安全部分：**
    *   當 `allowHTML = false` 時，使用 `element.textContent` 是完全安全的，能有效防止 DOM XSS。

*   **極度危險的部分 (`allowHTML = true`)：**
    *   當 `allowHTML = true` 時，它依賴 `sanitizeHTML` 函數，而這個函數的實作是**高度不安全的**。
    *   **`sanitizeHTML` 的漏洞分析：**
        1.  **基於黑名單的 Regex 過濾：** 這是安全領域公認的反模式。攻擊者總能找到新的或未被考慮到的方式來繞過 Regex。
        2.  **未處理的危險標籤：** 程式碼只移除了 `<script>` 和 `<iframe>`，但完全沒有處理其他數十種可執行腳本的標籤，例如：`<svg onload=alert(1)>`, `<img src=x onerror=alert(1)>`, `<details open ontoggle=alert(1)>`, `<video><source onerror="alert(1)">` 等。
        3.  **事件處理器繞過：** `on\w+\s*=\s*["'][^"']*["']` 的 Regex 無法處理不帶引號的屬性值，例如 `<svg onload=alert(1)>`。
        4.  **HTML 實體編碼繞過：** 攻擊者可以利用瀏覽器會對屬性值進行解碼的特性來繞過 `javascript:` 過濾。例如，`<a href="&#x6A;avascript:alert(1)">Click Me</a>`。`sanitizeHTML` 的 Regex 無法識別被編碼的 `javascript:` 字串。
        5.  **未使用的白名單變數：** 程式碼中定義了 `allowedTags` 和 `allowedAttrs`，但**完全沒有使用它們**來建構一個安全的 HTML 輸出，這顯示出實作上的疏忽。

    *   **結論：** `safeRender` 在允許 HTML 的情況下，幾乎無法抵禦任何有經驗的 XSS 攻擊。

#### **4. `getSecureURLParam` 的輸入驗證**

此函數從 URL 查詢參數中獲取值，並使用 `sanitizeInput`（預設為 `text` 類型）進行處理。

*   **優點：**
    *   正確使用了 `URLSearchParams`，避免了手動解析查詢字串的風險。
    *   對獲取的值進行了 HTML 實體編碼，如果這個值只是為了顯示為**純文字**，那麼這是安全的。

*   **弱點：**
    *   **誤導性的函數名稱：** `getSecureURLParam` 暗示返回的值在任何上下文中都是安全的，但事實並非如此。它只對「HTML 文本內容」是安全的。如果開發者誤用這個返回值去設置 `href` 或在 `<script>` 中使用，依然會產生漏洞。

#### **5. 整體架構的安全性設計**

*   **優點：**
    *   **集中化管理：** 將安全相關的功能模組化，是優秀的設計模式。
    *   **安全日誌：** `logSecurityEvent` 的設計非常好，有助於在開發和生產環境中監控潛在的安全事件。

*   **缺點：**
    *   **「造輪子」的反模式：** 安全領域最忌諱自己發明加密或清理演算法。`sanitizeHTML` 就是一個典型的例子，試圖用簡單的 Regex 解決一個極其複雜的問題。
    *   **邏輯缺陷：** `sanitizeInput` 和 `setSecureAttribute` 中「先編碼後驗證」的錯誤邏輯，顯示對安全處理流程的理解存在偏差。

#### **6. 潛在的攻擊向量和繞過方法**

1.  **DOM XSS (主要威脅):**
    *   **向量：** 任何呼叫 `safeRender(element, userInput, true)` 的地方。
    *   **繞過 Payload 範例：**
        *   `'<img src=x onerror=alert(document.domain)>'`
        *   `'<svg onload=alert(1)>'`
        *   `'<a href="&#x6A;avascript:alert(1)">Click me</a>'`

2.  **開放重定向:**
    *   **向量：** 任何使用 `validateURL` 來驗證重定向 URL，然後執行 `window.location.href = url` 的地方。
    *   **Payload:** `https://your-site.com/redirect?target=https://evil-phishing-site.com`

#### **7. 具體的安全改進建議**

**【核心建議】**

1.  **停用並替換 `sanitizeHTML`：**
    *   **立即行動：** 停止使用目前的 `sanitizeHTML` 函數。
    *   **解決方案：** 引入並使用一個經過業界審核、專門用於 HTML 清理的函式庫，例如 **DOMPurify**。這是目前客戶端 HTML 清理的黃金標準。
    *   **修復範例 (`safeRender`)：**
        ```javascript
        // 需要先引入 DOMPurify.js
        safeRender: function(element, content, allowHTML = false) {
            // ... (參數檢查) ...
            if (allowHTML) {
                // 使用 DOMPurify 進行安全清理
                const cleanContent = DOMPurify.sanitize(content, {
                    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br'], // 根據需求設定白名單
                    ALLOWED_ATTR: ['class']
                });
                element.innerHTML = cleanContent;
            } else {
                element.textContent = content;
            }
            // ... (錯誤處理) ...
        },
        ```

**【次要但重要的建議】**

2.  **修復 URL 處理邏輯：**
    *   **原則：** 永遠是**先驗證原始值，再根據使用場景進行編碼或直接使用**。
    *   **修復 `sanitizeInput` (`type='url'`)：** 此函數不應該處理 URL，因為 URL 的「清理」取決於上下文。建議移除此 `case`。
    *   **修復 `setSecureAttribute`：**
        ```javascript
        setSecureAttribute: function(element, attribute, value) {
            if (!element || typeof attribute !== 'string' || typeof value !== 'string') return;
            
            // 對 href, src 等 URL 屬性進行特殊處理
            if (attribute.toLowerCase() === 'href' || attribute.toLowerCase() === 'src') {
                // 1. 直接驗證原始 (raw) value
                if (this.validateURL(value)) {
                    element.setAttribute(attribute, value);
                } else {
                    // 如果驗證失敗，記錄事件並可選擇設置一個安全的預設值
                    this.logSecurityEvent('setSecureAttribute', 'Invalid URL blocked', { attribute, value });
                    element.setAttribute(attribute, '#'); 
                }
            } else {
                // 2. 對於其他屬性，進行 HTML 實體編碼後設置
                element.setAttribute(attribute, this.sanitizeInput(value, 'text'));
            }
        }
        ```

3.  **增強 `validateURL` 以防止開放重定向：**
    *   **解決方案：** 增加一個可選的 `allowedOrigins` 白名單參數。
    *   **修復範例：**
        ```javascript
        validateURL: function(url, allowedOrigins = []) {
            try {
                // ... (現有的協議檢查) ...

                const urlObj = new URL(url);
                
                // ... (現有的協議白名單檢查) ...

                // 新增：檢查 Origin 是否在白名單中
                if (allowedOrigins.length > 0 && ['http:', 'https:'].includes(urlObj.protocol)) {
                    // window.location.origin 是最常見的白名單項目
                    if (!allowedOrigins.includes(urlObj.origin)) {
                        this.logSecurityEvent('validateURL', 'Cross-origin URL blocked', { origin: urlObj.origin });
                        return false;
                    }
                }
                
                return true;
            } catch (error) {
                // ...
                return false;
            }
        },
        ```
    *   **使用方式：** `SecurityUtils.validateURL(userUrl, [window.location.origin])`

4.  **提高函數名稱的清晰度：**
    *   建議將 `getSecureURLParam` 重命名為 `getEncodedURLParamAsText`，以準確反映其功能——獲取參數並為其作為文本顯示進行編碼。

---
**最終結論：** 該安全模組的意圖是好的，但其實作，特別是 `sanitizeHTML`，存在致命缺陷。強烈建議立即採用像 **DOMPurify** 這樣的成熟函式庫來替換手動編寫的 HTML 清理邏輯，並根據上述建議修復 URL 處理流程，以建立一個真正有效的客戶端安全防線。
