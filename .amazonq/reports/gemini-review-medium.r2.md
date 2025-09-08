Data collection is disabled.
好的，這是在不修改任何檔案的前提下，針對您提出的 High/Medium 風險修補、殘餘風險、回退方案，以及補齊 Security/Accessibility 驗收點的文字建議。

---

### **High/Medium 風險修補建議與殘餘風險說明**

#### **1.【High】CWE-79: 跨網站指令碼 (Cross-site Scripting)**

此風險源於使用者輸入的內容未經充分過濾，就直接呈現在頁面上，導致惡意腳本可能被執行。

*   **修補方案：**
    在將任何使用者輸入（如姓名、職稱、公司等）插入到 DOM 之前，強制使用 `DOMPurify` 進行淨化。`DOMPurify` 已存在於專案的 `assets/dompurify.min.js`。

    **範例程式碼 (JavaScript):**
    ```javascript
    // 假設這是更新預覽的函數
    function updatePreview() {
      // ... 其他欄位

      let userNameInput = document.getElementById('name').value;

      // 【修補】使用 DOMPurify.sanitize() 淨化輸入
      let sanitizedUserName = DOMPurify.sanitize(userNameInput);

      // 將淨化後的內容插入預覽區域
      // 注意：因為是淨化後的 HTML，應使用 .innerHTML
      document.getElementById('name_preview').innerHTML = sanitizedUserName;

      // ... 其他欄位也應採用相同模式
    }
    ```

*   **測試案例：**
    1.  在「姓名」輸入框中，填入以下惡意酬載 (payload)：`Sheng-Fan Wu<img src=x onerror=alert('XSS')>`
    2.  **預期結果：** 頁面上的預覽區域應僅顯示 "Sheng-Fan Wu"，圖片標籤被移除，且**不應**跳出任何 alert 警告視窗。

*   **對應驗收點：**
    *   **Security:** `AC-SEC-01` - 所有使用者提供的輸入在渲染於 DOM 前都必須經過淨化。

#### **2.【Medium】CWE-829: 來自不受信控制域的功能引用 (Missing Subresource Integrity)**

專案中的 `<script>` 標籤未包含 `integrity` 屬性，若 `assets` 目錄下的 JS 檔案被竄改，將無法阻止惡意腳本的載入與執行。

*   **修補方案：**
    為所有本地引用的 `<script>` 標籤產生 SRI (Subresource Integrity) 雜湊值，並加入 `integrity` 與 `crossorigin="anonymous"` 屬性。

    **步驟：**
    1.  使用 `openssl` 或線上工具產生檔案的 SHA-384 雜湊值。
        ```bash
        # 產生 dompurify.min.js 的 SRI Hash
        openssl dgst -sha384 -binary assets/dompurify.min.js | openssl base64 -A
        ```
    2.  將產生的雜湊值加入 `index.html` (及其他相關頁面) 的 `<script>` 標籤。

    **範例程式碼 (HTML):**
    ```html
    <!-- 修補前 -->
    <script src="assets/dompurify.min.js"></script>
    <script src="assets/qrcode.min.js"></script>

    <!-- 修補後 (雜湊值為示意，請自行產生) -->
    <script src="assets/dompurify.min.js"
            integrity="sha384-abcdef123..."
            crossorigin="anonymous"></script>
    <script src="assets/qrcode.min.js"
            integrity="sha384-ghijkl456..."
            crossorigin="anonymous"></script>
    ```

*   **測試案例：**
    1.  完成修補後，正常載入頁面，確認所有功能（如 QR Code 生成）皆正常運作。
    2.  手動修改 `assets/dompurify.min.js` 檔案（例如在檔案末尾加入一個空格）。
    3.  重新整理頁面。
    4.  **預期結果：** 瀏覽器的開發者主控台 (Console) 應顯示一條關於 `integrity` 檢查失敗的錯誤訊息，且 `dompurify.min.js` 腳本不會被執行。

*   **對應驗收點：**
    *   **Security:** `AC-SEC-02` - 必須為所有第三方及本地託管的腳本使用子資源完整性 (SRI) 雜湊。

#### **3. 補齊《Security／Accessibility》未滿足之驗收點**

*   **項目：** `AC-A11Y-07` - 動態內容更新未通知螢幕閱讀器 (Screen Reader)。
*   **問題描述：** 當使用者在輸入框中修改內容時，卡片預覽區域會動態更新，但螢幕閱讀器無法感知到這些變化並讀出，對視覺障礙使用者不友善。
*   **修補方案：**
    在包圍卡片預覽的容器元素上，加入 `aria-live="polite"` 屬性。這會告訴輔助技術，當此區域內容變更時，應在使用者空閒時讀出更新。

    **範例程式碼 (HTML):**
    ```html
    <!-- 假設這是卡片預覽的容器 -->
    <div id="vcard-preview-container" aria-live="polite" aria-atomic="true">
      <!-- 卡片內容動態生成於此 -->
      <h2 id="name_preview"></h2>
      <p id="title_preview"></p>
      ...
    </div>
    ```
    *`aria-atomic="true"` 可確保每次更新都讀取整個區域，而非僅讀出變動部分，對卡片預覽此類情境更合適。*

*   **測試案例：**
    1.  開啟作業系統的螢幕閱讀器（例如 macOS 的 VoiceOver 或 Windows 的 NVDA）。
    2.  瀏覽至頁面，讓焦點停留在任一輸入框（如「姓名」）。
    3.  輸入或修改文字。
    4.  **預期結果：** 在您停止輸入後，螢幕閱讀器應能自動讀出卡片預覽區域更新後的內容，例如：「姓名，王小明」。

---

### **殘餘風險與回退方案**

*   **殘餘風險 (Residual Risks):**
    1.  **邏輯層風險：** `DOMPurify` 能有效防禦 XSS，但無法防禦應用程式自身的邏輯漏洞。例如，即使輸入是安全的，若後端處理不當，仍可能產生問題。
    2.  **設定風險：** `DOMPurify` 的安全性取決於其設定。目前使用預設設定已能覆蓋多數場景，但若未來需求變更（例如需要允許特定的 HTML 標籤），不當的設定可能再次引入風險。
    3.  **SRI 限制：** SRI 僅能確保檔案內容不被竄改，無法保證檔案來源本身是安全的（供應鏈攻擊）。定期審核並更新第三方函式庫仍是必要的。

*   **回退方案 (Fallback Plan):**
    本專案使用 Git 進行版本控制，這是最安全且最快速的回退路徑。
    *   **情境：** 若上述任一修補措施導致網站功能異常或出現非預期的錯誤。
    *   **操作步驟：**
        1.  首先，透過 `git log` 找到實施修補的提交紀錄 (commit)。
        2.  執行 `git revert <commit_hash>` 命令，其中 `<commit_hash>` 是您要撤銷的提交 ID。
        3.  Git 會建立一個新的「反向」提交，用以撤銷該次變更，同時保留完整的開發歷史紀錄。
    *   此方法遠比手動修改或 `git reset` 更安全，特別是在多人協作或已將變更推送到遠端的場景。
