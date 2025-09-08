# NFC 相容性測試指南

**目的**: 確保安全修補不影響已發行 NFC 卡片的相容性  
**範圍**: 精簡格式與完整格式數據載荷  
**重要性**: 避免破壞現有用戶的 NFC 卡片功能

## 📋 測試數據格式

### 1. 精簡格式測試數據（v2.1.0+）
```javascript
// 完整精簡格式
const compactFullData = {
    "n": "王小明",
    "t": "資深工程師", 
    "d": "資訊處",
    "e": "wang@moda.gov.tw",
    "p": "02-33567890",
    "m": "0912345678",
    "a": "https://i.imgur.com/example.jpg",
    "g": ["很高興認識您！", "歡迎交流技術"],
    "s": "FB: fb.com/wangxiaoming\nLINE: @wangtech"
};

// 最小精簡格式（僅必要欄位）
const compactMinData = {
    "n": "李小華",
    "t": "專員",
    "d": "秘書處"
};

// 部分欄位精簡格式
const compactPartialData = {
    "n": "陳小美",
    "t": "科長",
    "d": "數位策略司",
    "e": "chen@moda.gov.tw",
    "g": ["歡迎聯繫"]
};
```

### 2. 完整格式測試數據（v1.0+）
```javascript
// 完整格式
const fullFormatData = {
    "data": {
        "name": "張小強",
        "title": "處長",
        "department": "資源管理司",
        "email": "zhang@moda.gov.tw",
        "phone": "02-33567890",
        "mobile": "0987654321",
        "avatar": "https://i.imgur.com/example2.jpg",
        "greetings": ["歡迎指教"],
        "socialLinks": {
            "email": "mailto:zhang@moda.gov.tw",
            "socialNote": "LINE: @zhangofficial"
        }
    }
};
```

### 3. 雙語格式測試數據（bilingual-common.js）
```javascript
// 雙語精簡格式（使用 ~ 分隔符）
const bilingualCompactData = {
    "n": "王小明~John Wang",
    "t": "資深工程師~Senior Engineer",
    "d": "資訊處",  // 使用部門翻譯字典
    "e": "wang@moda.gov.tw",
    "p": "02-33567890",
    "m": "0912345678",
    "a": "https://i.imgur.com/example.jpg",
    "g": ["很高興認識您！~Nice to meet you!", "歡迎交流技術~Welcome to tech exchange"],
    "s": "FB: fb.com/wangxiaoming\nLINE: @wangtech"
};

// 舊版雙語格式（8欄位，無手機號碼）
const bilingualLegacyData = {
    "n": "李小華~Lisa Lee",
    "t": "專員~Specialist",
    "d": "秘書處",
    "e": "lee@moda.gov.tw",
    "p": "02-33567890",
    "a": "https://i.imgur.com/example2.jpg",
    "g": ["歡迎聯繫~Welcome to contact"],
    "s": "LINE: @lisaofficial"
};
```

## 🧪 測試案例

### Test Case 1: 精簡格式解析
```javascript
function testCompactFormatParsing() {
    const testData = compactFullData;
    
    // 1. 格式檢測
    assert(hasCompactKeys(testData), "應該識別為精簡格式");
    
    // 2. 安全驗證
    assert(validateNFCData(testData), "精簡格式應通過安全驗證");
    
    // 3. 格式轉換
    const converted = convertCompactToFull(testData);
    assert(converted.data.name === "王小明", "姓名轉換正確");
    assert(converted.data.title === "資深工程師", "職稱轉換正確");
    
    // 4. 渲染測試
    renderCard(converted);
    assert(document.getElementById('user-name').textContent === "王小明", "渲染正確");
}
```

### Test Case 2: 完整格式相容性
```javascript
function testFullFormatCompatibility() {
    const testData = fullFormatData;
    
    // 1. 格式檢測
    assert(!hasCompactKeys(testData), "應該識別為完整格式");
    
    // 2. 安全驗證
    assert(validateNFCData(testData), "完整格式應通過安全驗證");
    
    // 3. 直接渲染（無需轉換）
    renderCard(testData);
    assert(document.getElementById('user-name').textContent === "張小強", "渲染正確");
}
```

### Test Case 3: 雙語格式解析與切換
```javascript
function testBilingualFormatParsing() {
    const testData = bilingualCompactData;
    
    // 1. 雙語格式檢測
    const decoded = decodeCompact(encodedBilingualData);
    assert(decoded !== null, "雙語格式應該成功解碼");
    
    // 2. 雙語解析測試
    const nameResult = parseBilingual(decoded.name);
    assert(nameResult.zh === "王小明", "中文姓名解析正確");
    assert(nameResult.en === "John Wang", "英文姓名解析正確");
    
    // 3. 語言切換測試
    renderBilingualCard(decoded, 'zh');
    assert(document.getElementById('userName').textContent === "王小明", "中文渲染正確");
    
    switchLanguage('en');
    assert(document.getElementById('userName').textContent === "John Wang", "英文切換正確");
    
    // 4. 舊版雙語格式相容性
    const legacyDecoded = decodeCompact(encodedLegacyBilingualData);
    assert(legacyDecoded.mobile === '', "舊版格式手機號碼為空");
    assert(legacyDecoded.name === "李小華~Lisa Lee", "舊版雙語格式保持");
}
```

### Test Case 4: 邊界條件測試
```javascript
function testBilingualEdgeCases() {
    // 單語內容在雙語環境
    const singleLangData = { "n": "純中文姓名", "t": "純中文職稱" };
    const nameResult = parseBilingual(singleLangData.n);
    assert(nameResult.zh === "純中文姓名", "單語中文正確");
    assert(nameResult.en === "純中文姓名", "單語英文回退正確");
    
    // 部分雙語內容
    const partialBilingualData = { 
        "n": "王小明~John Wang", 
        "t": "純中文職稱"  // 無英文對應
    };
    const titleResult = parseBilingual(partialBilingualData.t);
    assert(titleResult.zh === "純中文職稱", "部分雙語中文正確");
    assert(titleResult.en === "純中文職稱", "部分雙語英文回退正確");
    
    // 空的雙語分隔符
    const emptyBilingualData = { "n": "姓名~", "t": "~Title" };
    const emptyZhResult = parseBilingual(emptyBilingualData.n);
    const emptyEnResult = parseBilingual(emptyBilingualData.t);
    assert(emptyZhResult.zh === "姓名", "空英文處理正確");
    assert(emptyEnResult.en === "Title", "空中文處理正確");
    
    // 傳統邊界測試
    const emptyCompact = { "n": "", "t": "", "d": "" };
    assert(validateNFCData(emptyCompact), "空值應該被接受");
    
    const missingName = { "t": "職稱", "d": "部門" };
    assert(!validateNFCData(missingName), "缺少姓名應該被拒絕");
}
```

## 🔍 驗證檢查點

### 1. 格式識別正確性
- [ ] 精簡格式正確識別
- [ ] 完整格式正確識別
- [ ] **雙語精簡格式正確識別**
- [ ] **舊版雙語格式（8欄位）正確識別**
- [ ] 混合格式處理策略
- [ ] 無效格式拒絕機制

### 2. 數據轉換完整性
- [ ] 所有精簡欄位正確映射
- [ ] 預設值正確填充
- [ ] 可選欄位正確處理
- [ ] 陣列欄位正確轉換
- [ ] **雙語分隔符（~）正確解析**
- [ ] **單語內容在雙語環境正確回退**

### 3. 安全驗證相容性
- [ ] 舊格式通過驗證
- [ ] 新格式通過驗證
- [ ] **雙語格式通過驗證**
- [ ] 惡意數據被阻擋
- [ ] 邊界值正確處理

### 4. 渲染功能完整性
- [ ] 所有欄位正確顯示
- [ ] 可選欄位正確隱藏
- [ ] 社群連結正確處理
- [ ] 頭像載入正常
- [ ] **語言切換功能正常**
- [ ] **雙語內容正確顯示**
- [ ] **部門翻譯字典正確運作**

## 🚨 回歸測試重點

### 關鍵功能驗證
1. **NFC 卡片讀取**: 確保所有格式的 NFC 卡片都能正常讀取
2. **數據解析**: 確保 Base64 解碼和 JSON 解析正常
3. **格式轉換**: 確保 `convertCompactToFull` 函數未被破壞
4. **頁面渲染**: 確保所有欄位正確顯示
5. **功能完整性**: 確保 vCard 下載、QR 碼生成等功能正常

### 效能驗證
- [ ] 解析時間無明顯增加
- [ ] 記憶體使用無異常增長
- [ ] 頁面載入速度保持正常

## 📝 測試執行步驟

### 1. 準備測試環境
```bash
# 創建測試頁面
cp index.html test-compatibility.html
# 添加測試腳本
```

### 2. 執行自動化測試
```javascript
// 在瀏覽器控制台執行
runCompatibilityTests();
```

### 3. 手動驗證
- 使用實際 NFC 卡片測試
- 驗證各種數據格式
- 確認用戶體驗無變化

### 4. 記錄測試結果
- 測試通過率
- 發現的問題
- 修復建議

## ⚠️ 注意事項

### 修補原則
1. **保持現有函數**: 不修改 `convertCompactToFull` 函數
2. **添加安全層**: 在現有邏輯基礎上添加驗證
3. **優雅降級**: 驗證失敗時提供友好錯誤訊息
4. **向下相容**: 確保舊版本 NFC 卡片持續可用

### 風險控制
- 分階段部署測試
- 保留回滾機制
- 監控用戶反饋
- 準備緊急修復方案

---
**測試負責人**: 待指派  
**最後更新**: 2025-09-08
