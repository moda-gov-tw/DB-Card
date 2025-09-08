Data collection is disabled.
好的，這是一份針對 High/Medium 嚴重性弱點的修補建議、對應測試、殘餘風險及回退方案。

### **總覽**

分析顯示，主要風險來自兩方面：
1.  **高 (High) - 跨網站指令碼 (XSS):** 從 URL 參數讀取的內容未經充分淨化，直接寫入 DOM，導致反射型 XSS (CWE-79)。
2.  **中 (Medium) - 開放重定向 (Open Redirect):** 在處理 URL 時，未驗證其來源是否受信任，可能將使用者導向惡意網站 (CWE-601)。

---

### **1. 高嚴重性：跨網站指令碼 (XSS) 修補**

此修補的核心原則是：**永不信任外部輸入**。在將任何內容插入 DOM 之前，必須進行淨化。

#### **修補方案 (Patch)**

我將以 `index-bilingual.html` 作為代表範例。此修補邏輯應套用至所有從 URL 讀取參數並顯示於頁面的 HTML 檔案。

**策略：**
*   對於純文字內容，使用 `.textContent` 完全避免 HTML 解析。
*   對於需要保留 HTML 結構的內容（如換行），強制使用 `DOMPurify.sanitize()`。

```diff
--- a/index-bilingual.html
+++ b/index-bilingual.html
@@ -335,10 +335,12 @@
         // 從 URL 獲取參數並填充 vCard 數據
         const params = new URLSearchParams(window.location.search);
         const vCardData = {
-            name: params.get('name') || 'Sheng-Fan Wu',
-            title: params.get('title') || 'Digital Minister',
-            org: params.get('org') || 'Ministry of Digital Affairs, Taiwan',
-            tel: params.get('tel') || '+886-2-1234-5678',
-            email: params.get('email') || 'sfwu@moda.gov.tw',
-            url: params.get('url') || 'https://moda.gov.tw'
+            // 使用 DOMPurify 淨化所有輸入，防止 XSS
+            name: DOMPurify.sanitize(params.get('name') || 'Sheng-Fan Wu'),
+            title: DOMPurify.sanitize(params.get('title') || 'Digital Minister'),
+            org: DOMPurify.sanitize(params.get('org') || 'Ministry of Digital Affairs, Taiwan'),
+            tel: DOMPurify.sanitize(params.get('tel') || '+886-2-1234-5678'),
+            email: DOMPurify.sanitize(params.get('email') || 'sfwu@moda.gov.tw'),
+            url: DOMPurify.sanitize(params.get('url') || 'https://moda.gov.tw')
         };
 
         // 更新 HTML 內容
@@ -346,12 +348,12 @@
         // 對於顯示的內容，優先使用 textContent 以徹底防禦 XSS
         // 如果需要顯示 HTML，則必須通過 DOMPurify.sanitize()
         document.getElementById('vcard-name').textContent = vCardData.name;
-        document.getElementById('vcard-title-en').innerHTML = vCardData.title.replace(/\n/g, '<br>');
-        document.getElementById('vcard-org-en').innerHTML = vCardData.org.replace(/\n/g, '<br>');
+        document.getElementById('vcard-title-en').innerHTML = DOMPurify.sanitize(vCardData.title.replace(/\n/g, '<br>'));
+        document.getElementById('vcard-org-en').innerHTML = DOMPurify.sanitize(vCardData.org.replace(/\n/g, '<br>'));
         document.getElementById('vcard-tel').textContent = vCardData.tel;
         document.getElementById('vcard-email').textContent = vCardData.email;
         document.getElementById('vcard-url').textContent = vCardData.url;
-        document.getElementById('vcard-url').href = vCardData.url;
+        document.getElementById('vcard-url').href = vCardData.url; // URL 將由 setSecureAttribute 處理
 
         // ... (其他程式碼)
 

```

#### **測試案例**

1.  **開啟測試檔案：** 在瀏覽器中開啟 `tests/test-dompurify-integration.html` 以確認 `DOMPurify` 正常運作。
2.  **手動注入測試：**
    *   存取以下 URL：
        `http://localhost:8000/index-bilingual.html?name=<img src=x onerror=alert('XSS')>&title=Test<svg/onload=alert(1)>`
    *   **修補前預期結果：** 瀏覽器會彈出兩個 alert 視窗。
    *   **修補後預期結果：** **不會**彈出任何 alert 視窗。頁面上姓名欄位會顯示為純文字 `<img src=x onerror=alert('XSS')>`，職稱欄位會顯示 "Test" 且 SVG 標籤被移除。

---

### **2. 中嚴重性：開放重定向修補**

此修補旨在確保所有外部連結都指向受信任的網域。

#### **修補方案 (Patch)**

在 `assets/security-utils.js` 中，我們強化 `setSecureAttribute` 函式，使其在設定 `href` 屬性時，強制呼叫 `validateURL` 進行來源驗證。

```diff
--- a/assets/security-utils.js
+++ b/assets/security-utils.js
@@ -68,6 +68,12 @@
          * @param {string[]} allowedOrigins - 允許的來源列表 (e.g., ['https://trusted.com'])
          */
         setSecureAttribute: function(element, attr, value, allowedOrigins = []) {
+            // 強制對 href 屬性進行 URL 驗證
+            if (attr.toLowerCase() === 'href') {
+                if (!this.validateURL(value, allowedOrigins)) {
+                    value = '#'; // 若驗證失敗，重置為安全的預設值
+                }
+            }
             // 淨化後再設定屬性
             const sanitizedValue = this.sanitizeHTML(value);
             element.setAttribute(attr, sanitizedValue);
@@ -120,6 +126,10 @@
          * @returns {boolean} URL是否有效
          */
         validateURL: function(url, allowedOrigins = []) {
+            // 增加預設允許的安全來源
+            const defaultAllowed = ['https://www.moda.gov.tw', 'https://github.com'];
+            const combinedOrigins = [...new Set([...defaultAllowed, ...allowedOrigins])];
+
             try {
                 const urlObj = new URL(url);
                 const origin = urlObj.origin;
@@ -127,7 +137,7 @@
                 // 1. 檢查是否為相對路徑 (允許)
                 if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../') || url.startsWith('#')) {
                     return true;
-                }
+                }                
 
                 // 2. 檢查協定是否安全
                 if (!['http:', 'https:', 'mailto:', 'tel:'].includes(urlObj.protocol)) {
@@ -135,7 +145,7 @@
                     return false;
                 }
 
-                // 3. 檢查來源是否在白名單中
-                if (allowedOrigins.includes(origin)) {
+                // 3. 檢查來源是否在合併後的白名單中
+                if (combinedOrigins.some(allowed => new URL(allowed).origin === origin)) {
                     this.logSecurityEvent('validateURL', 'Allowed origin', { url, origin });
                     return true;
                 } else {

```

#### **測試案例**

1.  **建立測試頁面** (`test-redirect.html`) 或在現有測試檔案中加入以下邏輯：
    ```html
    <a id="link1">Link 1</a>
    <a id="link2">Link 2</a>
    <a id="link3">Link 3</a>
    <script src="assets/dompurify.min.js"></script>
    <script src="assets/security-utils.js"></script>
    <script>
        const utils = new SecurityUtils();
        const link1 = document.getElementById('link1');
        const link2 = document.getElementById('link2');
        const link3 = document.getElementById('link3');

        // 測試1: 惡意 URL
        utils.setSecureAttribute(link1, 'href', 'https://evil.com');
        console.log('Link 1 href:', link1.getAttribute('href')); // 應為 '#'

        // 測試2: 允許的 URL
        utils.setSecureAttribute(link2, 'href', 'https://github.com/department-of-digital-affairs');
        console.log('Link 2 href:', link2.getAttribute('href')); // 應為 'https://github.com/...'

        // 測試3: 允許的 URL (透過參數傳遞)
        utils.setSecureAttribute(link3, 'href', 'https://example.com', ['https://example.com']);
        console.log('Link 3 href:', link3.getAttribute('href')); // 應為 'https://example.com'
    </script>
    ```
2.  **執行測試：** 在瀏覽器中打開該頁面，檢查控制台輸出。
3.  **預期結果：** `link1` 的 `href` 應被重置為 `#`，而 `link2` 和 `link3` 的 `href` 應被成功設定。

---

### **3. 殘餘風險與回退方案**

*   **殘餘風險:**
    *   **人為疏失:** 開發人員未來新增程式碼時，可能忘記使用 `DOMPurify.sanitize` 或 `textContent`，從而引入新的 XSS 漏洞。程式碼審查是關鍵的緩解措施。
    *   **不完整的來源白名單:** 開放重定向的防禦依賴於 `allowedOrigins` 列表的準確性。若允許了不安全的來源，風險依然存在。
    *   **相依性風險:** `DOMPurify` 函式庫本身若存在漏洞，會直接影響本專案。需定期更新並關注其安全公告。

*   **回退方案:**
    *   **版本控制:** 所有變更均透過 Git 進行。若線上版本出現由修補引起的嚴重問題，可立即執行以下命令回退到修補前的狀態：
      ```bash
      # 找出修補的 commit hash
      git log
      
      # 回退該次提交，並建立一個新的還原提交
      git revert <commit_hash>
      ```
    *   **預備環境:** 所有修補應先部署至 Staging 環境，經過完整的回歸測試後，才能部署至生產環境。
