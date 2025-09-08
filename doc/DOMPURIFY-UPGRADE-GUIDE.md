# DOMPurify 升級實施指南

**文檔版本：** v1.0  
**建立日期：** 2025年9月8日  
**目標：** 替代 security-utils.js 的 HTML 清理機制  
**優先級：** Critical  

## 🎯 升級目標

### 解決問題
- 修復 8 個 High 風險 security-utils.js 弱點
- 根本性解決 HTML 清理安全問題
- 提升整體安全防護等級

### 預期效果
- 解決 19+ XSS 相關弱點
- 降低安全風險等級至 Low
- 符合業界最佳實踐

## 📋 實施計畫

### 階段 1：準備工作 (1-2 小時)

#### 1.1 引入 DOMPurify
```html
<!-- 方案 A：CDN 引入 (推薦) -->
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js" 
        integrity="sha384-FGosfzp4Si4ecU8GtH9UyKhbibWBr3GRYjNZZc2JbKy4FLdvRK9xZXyKzpKF8pGn" 
        crossorigin="anonymous"></script>

<!-- 方案 B：本地部署 -->
<script src="assets/dompurify.min.js"></script>
```

#### 1.2 下載本地備份
```bash
# 下載到 assets 目錄
curl -o assets/dompurify.min.js \
  https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js
```

### 階段 2：核心修改 (2-3 小時)

#### 2.1 修改 security-utils.js
```diff
--- a/assets/security-utils.js
+++ b/assets/security-utils.js
@@ -80,50 +80,15 @@
         sanitizeHTML: function(html) {
-            const allowedTags = ['b', 'i', 'em', 'strong', 'span', 'br'];
-            const allowedAttrs = ['class'];
-            
-            // 複雜的 Regex 過濾邏輯...
-            let cleaned = html.replace(/<script[^>]*>.*?<\/script>/gi, '')
-            // ... 更多 Regex 規則
-            
-            return cleaned;
+            // 檢查 DOMPurify 可用性
+            if (typeof DOMPurify === 'undefined') {
+                console.error('DOMPurify not loaded');
+                return ''; // 安全降級
+            }
+            
+            return DOMPurify.sanitize(html, {
+                ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br'],
+                ALLOWED_ATTR: ['class'],
+                KEEP_CONTENT: true,
+                RETURN_DOM: false
+            });
         },
```

#### 2.2 更新所有 HTML 檔案
需要在以下檔案的 `<head>` 中添加 DOMPurify 引用：
- `index.html`
- `index1.html`
- `index-en.html`
- `index1-en.html`
- `index-personal.html`
- `index-personal-en.html`
- `index-bilingual.html`
- `index-bilingual-personal.html`
- `nfc-generator.html`
- `nfc-generator-bilingual.html`

### 階段 3：測試驗證 (1-2 小時)

#### 3.1 執行安全測試
```bash
# 開啟測試頁面驗證
open tests/test-security-comprehensive.html
open tests/test-security-final.html
```

#### 3.2 XSS 防護測試
測試以下 Payload 是否被正確過濾：
```javascript
// 測試案例
const testPayloads = [
    '<img src=x onerror=alert(1)>',
    '<svg onload=alert(1)>',
    '<script>alert("XSS")</script>',
    '<a href="javascript:alert(1)">Click</a>',
    '<details open ontoggle=alert(1)>'
];
```

## 🔧 配置選項

### 基本配置
```javascript
const config = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br'],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true,
    RETURN_DOM: false
};
```

### 進階配置（如需要）
```javascript
const advancedConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br', 'p', 'div'],
    ALLOWED_ATTR: ['class', 'id'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['style', 'script'],
    FORBID_ATTR: ['onerror', 'onload'],
    KEEP_CONTENT: true
};
```

## ⚠️ 注意事項

### 相容性檢查
- 確保所有目標瀏覽器支援 DOMPurify
- 測試 CDN 可用性與備援方案

### 效能考量
- DOMPurify 壓縮後約 15KB (gzipped)
- 比複雜 Regex 方案效能更好
- 記憶體使用輕量級

### 安全考量
- 使用 SRI (Subresource Integrity) 驗證
- 定期更新到最新版本
- 監控安全公告

## 📋 驗收標準

### 功能驗收
- [ ] DOMPurify 正確載入
- [ ] sanitizeHTML 函數正常運作
- [ ] 所有 XSS 測試通過
- [ ] 合法 HTML 正確保留

### 安全驗收
- [ ] 所有測試 Payload 被過濾
- [ ] CodeQL 掃描弱點減少
- [ ] 安全測試套件全部通過
- [ ] 無功能回歸問題

### 效能驗收
- [ ] 頁面載入時間無明顯增加
- [ ] HTML 清理效能提升
- [ ] 記憶體使用正常

## 🔄 回退方案

如果升級出現問題，可以快速回退：

```bash
# 1. 恢復原始 security-utils.js
git checkout HEAD~1 -- assets/security-utils.js

# 2. 移除 DOMPurify 引用
# 手動從 HTML 檔案中移除 <script> 標籤

# 3. 重新測試
open tests/test-security-comprehensive.html
```

## 📚 相關資源

- [DOMPurify 官方文檔](https://github.com/cure53/DOMPurify)
- [安全掃描分析報告](./SECURITY-ANALYSIS-20250908.md)
- [弱點修補任務清單](./VULNERABILITY-PATCH-TASKS.md)

---
**維護說明：** 升級完成後應更新此文檔，記錄實際遇到的問題與解決方案。
