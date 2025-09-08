# DOMPurify 升級評估報告

**評估日期：** 2025年9月8日  
**評估範圍：** 替代 security-utils.js HTML 清理機制  
**目標：** 解決現有 Regex 過濾的安全漏洞  

## 📊 現狀分析

### 當前 security-utils.js 問題
根據 Gemini 專家審查和 CodeQL 掃描：

1. **基於 Regex 的黑名單過濾** - 容易被繞過
2. **8 個 High 風險弱點** - 包括 Bad HTML filtering regexp
3. **不完整的多字元清理** - 存在邏輯漏洞
4. **URL 驗證錯誤** - 先編碼後驗證的錯誤流程

### 影響範圍
- 19 個 Client-side XSS 弱點直接相關
- 所有使用 `safeRender(allowHTML=true)` 的位置
- 核心安全防護機制失效

## 🔍 DOMPurify 技術評估

### 優勢分析

#### 1. 安全性
- **業界標準** - 被 GitHub、Google、Microsoft 等採用
- **白名單機制** - 預設拒絕所有，僅允許安全標籤
- **持續更新** - 活躍維護，快速修補新發現的繞過方法
- **經過實戰驗證** - 數百萬網站使用，安全記錄良好

#### 2. 技術特性
```javascript
// DOMPurify 基本使用
const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br'],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true
});
```

#### 3. 檔案大小與效能
- **壓縮後大小：** ~45KB (gzipped ~15KB)
- **載入方式：** CDN 或本地檔案
- **效能：** 比 Regex 方案更快且更安全
- **記憶體使用：** 輕量級，無明顯影響

### 整合方案

#### 方案 A：完全替換 (推薦)
```diff
--- a/assets/security-utils.js
+++ b/assets/security-utils.js
@@ -1,5 +1,6 @@
 /**
  * NFC Digital Business Card - Security Utilities
+ * 使用 DOMPurify 進行 HTML 清理
  */
+<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js"></script>

@@ -80,50 +81,15 @@
         sanitizeHTML: function(html) {
-            const allowedTags = ['b', 'i', 'em', 'strong', 'span', 'br'];
-            const allowedAttrs = ['class'];
-            
-            // 複雜的 Regex 過濾邏輯...
-            let cleaned = html.replace(/<script[^>]*>.*?<\/script>/gi, '')
-            // ... 更多 Regex 規則
-            
-            return cleaned;
+            return DOMPurify.sanitize(html, {
+                ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br'],
+                ALLOWED_ATTR: ['class'],
+                KEEP_CONTENT: true,
+                RETURN_DOM: false
+            });
         },
```

#### 方案 B：混合方案
保留其他 security-utils.js 功能，僅替換 HTML 清理：

```javascript
// 檢查 DOMPurify 可用性
if (typeof DOMPurify !== 'undefined') {
    // 使用 DOMPurify
    return DOMPurify.sanitize(html, config);
} else {
    // 降級到改進的 Regex（臨時方案）
    return this.legacySanitizeHTML(html);
}
```

## 📋 實施計畫

### 階段 1：準備工作 (1-2 小時)
1. **CDN 整合**
   ```html
   <!-- 在所有 HTML 檔案的 <head> 中添加 -->
   <script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js" 
           integrity="sha384-..." crossorigin="anonymous"></script>
   ```

2. **本地備份方案**
   - 下載 `purify.min.js` 到 `assets/` 目錄
   - 修改引用路徑為相對路徑

### 階段 2：核心修改 (2-3 小時)
1. **修改 sanitizeHTML 函數**
2. **更新所有調用點**
3. **保持 API 相容性**

### 階段 3：測試驗證 (1-2 小時)
1. **執行現有測試套件**
2. **新增 DOMPurify 特定測試**
3. **驗證所有 XSS 防護有效**

## ⚖️ 風險與成本分析

### 優勢
✅ **安全性大幅提升** - 解決所有已知 HTML 清理漏洞  
✅ **維護成本降低** - 不需要自維護 Regex 規則  
✅ **未來保障** - 持續更新應對新威脅  
✅ **效能提升** - 比複雜 Regex 更快  
✅ **標準化** - 使用業界標準解決方案  

### 風險與緩解
⚠️ **新依賴引入**  
- 緩解：使用 CDN + 本地備份雙重保障
- 影響：輕微，檔案大小可接受

⚠️ **相容性問題**  
- 緩解：DOMPurify 支援所有現代瀏覽器
- 影響：極低，目標瀏覽器完全支援

⚠️ **API 變更風險**  
- 緩解：保持現有 API 介面不變
- 影響：無，對現有代碼透明

## 🎯 建議決策

### 強烈建議升級 DOMPurify

**理由：**
1. **立即解決 8 個 High 風險弱點**
2. **根本性解決 HTML 清理問題**
3. **實施成本低，風險可控**
4. **符合業界最佳實踐**

### 實施優先級：**Critical**

考慮到：
- CodeQL 掃描顯示 66 個弱點
- security-utils.js 存在關鍵漏洞
- 現有修補機制失效

**建議立即實施，預計 4-6 小時完成完整升級。**

## 📝 後續行動

1. **立即行動：** 開始 DOMPurify 整合
2. **並行任務：** 修復其他 URL 驗證邏輯
3. **驗證測試：** 執行完整安全測試套件
4. **重新掃描：** 完成後重新執行 CodeQL 掃描

**預期結果：** 解決 19+ 個 XSS 相關弱點，大幅降低安全風險等級。
