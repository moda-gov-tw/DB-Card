Data collection is disabled.
好的，作為前端安全專家，我將針對您提出的 DOMPurify 升級方案進行全面評估。

### DOMPurify 升級方案評估報告

#### 1. 技術可行性與安全效益

*   **技術可行性：極高**
    *   DOMPurify 是一個純客戶端 JavaScript 函式庫，專為 HTML、MathML 和 SVG 的淨化而設計。它不依賴任何後端或特定框架，可以輕易地整合到任何前端專案中，僅需引入其 JS 檔案即可使用。
    *   它的 API 非常簡潔 (`DOMPurify.sanitize(dirty_html)`)，學習曲線平緩，開發人員可以快速上手。

*   **安全效益：極高**
    *   **根本性解決方案**：與目前 `security-utils.js` 中基於正規表示式（Regex）的黑名單過濾方式不同，DOMPurify 採用了更為安全和健壯的白名單機制。它會將輸入的 HTML 字串解析成 DOM Tree，然後遍歷所有節點，只保留在白名單中定義的安全標籤和屬性，最後再將其序列化回安全的 HTML 字串。
    *   **防禦 XSS**：此機制能有效防禦各種類型的 DOM-based XSS 攻擊，這是 CodeQL 發現的 66 個弱點中最核心的問題。Regex 過濾極易被繞過（例如，使用不同的事件處理器、編碼或不常見的標籤），而 DOMPurify 則能從根本上杜絕此類風險。
    *   **持續更新**：DOMPurify 由安全社群積極維護，能應對新型的瀏覽器攻擊向量和漏洞，這是自建 Regex 無法比擬的優勢。
    *   **量化效益**：預期導入 DOMPurify 後，CodeQL 報告中與「Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')」相關的弱點（如 CWE-79）將能被大規模地修復。

#### 2. 整合複雜度與風險評估

*   **整合複雜度：中等**
    *   **引入成本低**：將 `dompurify.min.js` 檔案加入到 `assets/` 目錄下，並在 HTML 中引用，這個步驟非常簡單。
    *   **重構成本中等**：主要的複雜度在於**識別並取代**所有呼叫舊有 `security-utils.js` 過濾函式的地方。這需要對程式碼庫進行全域搜尋，找出所有不安全的資料處理點，並將其替換為 `DOMPurify.sanitize()`。這是一個重複性高但至關重要的工作。

*   **風險評估：**
    *   **功能破壞風險（低）**：若應用程式的某些部分依賴於目前被視為「不安全」但對功能無害的 HTML 標籤或屬性（例如特定的 `style` 屬性），DOMPurify 的預設配置可能會將其過濾，導致顯示異常。此風險可透過自訂 DOMPurify 的白名單配置來管理。
    *   **替換不完全風險（高）**：最大的風險是未能找到並替換所有脆弱點。任何遺漏的呼叫都將使該處的 XSS 漏洞繼續存在。這需要嚴謹的程式碼審查和測試來緩解。
    *   **不當配置風險（低）**：DOMPurify 提供了一些危險的配置選項（如 `FORCE_BODY: true` 可能導致額外問題）。只要堅持使用預設安全配置，此風險很低。

#### 3. 與現有 `security-utils.js` 的相容性

*   **取代關係，而非相容**：DOMPurify 應被視為 `security-utils.js` 中 Regex 過濾邏輯的**完全取代品**。兩者不應該並存處理同一份資料，因為 `security-utils.js` 的方法已被證實無效。
*   **建議整合策略**：
    1.  保留 `security-utils.js` 這個檔案作為一個安全相關的工具函式集。
    2.  在 `security-utils.js` 內部，引入並封裝一個新的淨化函式，例如 `sanitizeHTML(input)`，其內部實作直接呼叫 `DOMPurify.sanitize(input)`。
    3.  將專案中所有舊的過濾函式呼叫，全部替換為對這個新的 `sanitizeHTML` 函式的呼叫。
    4.  最後，從 `security-utils.js` 中刪除所有舊的、不安全的 Regex 過濾程式碼。
    *   這樣做的好處是提供了一個統一的、易於管理的安全介面，未來若需更換底層函式庫，只需修改 `security-utils.js` 一個檔案。

#### 4. 實施優先級建議

*   **優先級：Critical (極重大)**
    *   **理由**：CodeQL 已識別出 66 個弱點，且核心問題在於一個「嚴重漏洞」的 Regex 過濾器。這意味著應用程式目前正暴露在大量、已知的 XSS 風險之下，攻擊者可能利用這些漏洞竊取使用者資料、劫持會話或執行惡意操作。此問題直接影響使用者安全與系統完整性，必須立即處理。

#### 5. 具體實施步驟與驗證方法

*   **實施步驟：**
    1.  **引入函式庫**：下載最新穩定版的 `dompurify.min.js`，並將其放置在 `assets/` 目錄下。在所有需要進行資料淨化的 HTML 頁面中，透過 `<script>` 標籤引入它。
    2.  **重構 `security-utils.js`**：按照第 3 點的建議，建立一個 `sanitizeHTML` 函式來封裝 `DOMPurify.sanitize()`。
    3.  **全域取代**：使用 IDE 或 `grep` 等工具，在整個專案中搜尋舊過濾函式的呼叫點，並將其逐一替換為對 `security-utils.js` 中新 `sanitizeHTML` 函式的呼叫。
    4.  **程式碼清理**：在確認所有呼叫點都已替換後，安全地從 `security-utils.js` 中刪除舊的 Regex 相關程式碼。

*   **驗證方法：**
    1.  **單元測試**：為 `security-utils.js` 中的新 `sanitizeHTML` 函式編寫專門的測試案例。測試應包含：
        *   **惡意 Payload**：如 `<img src=x onerror=alert(1)>`, `<svg onload=alert(1)>`, `<a href="javascript:alert(1)">Click</a>` 等，驗證其是否被成功過濾。
        *   **合法 Payload**：如 `<b>bold</b>`, `<p style="color:blue;">text</p>` 等，驗證合法的 HTML 標籤和樣式是否被正確保留（根據需求配置）。
    2.  **整合測試**：在 `tests/` 目錄下建立或修改測試頁面（如 `test-security-comprehensive.html`），模擬使用者在各個輸入框中提交惡意 Payload，驗證頁面不會執行任何腳本。
    3.  **CodeQL 重新掃描**：在完成重構後，重新執行 CodeQL 掃描。預期與 XSS 相關的弱點數量應大幅下降。這是衡量修復成效最直接的指標。
    4.  **手動滲透測試**：針對先前發現弱點的具體頁面和輸入欄位，手動嘗試注入 XSS 攻擊字串，確認漏洞已被封堵。
    5.  **功能回歸測試**：全面測試應用程式，確保引入 DOMPurify 後，原有的富文本顯示等功能沒有因為過度過濾而損壞。
