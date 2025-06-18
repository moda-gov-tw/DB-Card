# GitHub-based 數位名片系統

一個可部署於 GitHub Pages 的網頁名片系統，支援 NFC 和 QR 碼快速開啟，並自動觸發 .vcf 聯絡人下載。

## 🎯 功能特色

- 📱 **行動裝置優化**：支援 NFC 或 QR 碼快速開啟
- 📇 **自動下載聯絡人**：一鍵下載 .vcf 檔案並加入聯絡人
- 🖼 **個人化展示**：大頭照、社群連結、職稱資訊與動態個人簡介
- 🌐 **GitHub Pages 部署**：無需伺服器，直接部署至 GitHub Pages
- 📱 **跨平台相容**：Android 和 iOS 均可正常使用

## 📦 專案結構

```
├── index.html              # 主網頁入口
├── lin-chengtao.vcf        # vCard 檔案
├── assets/
│   ├── photo.png           # 大頭照
│   └── logo.png            # 機關商標（選擇性）
├── README.md               # 專案說明
└── .github/workflows/      # CI 部署（未來擴充）
```

## 🚀 部署方式

1. Fork 此專案
2. 在 GitHub Repository 設定中開啟 GitHub Pages
3. 選擇 main branch 作為來源
4. 訪問 `https://yourusername.github.io/repository-name/`

## 📱 使用方式

1. **網頁訪問**：直接開啟 GitHub Pages 網址
2. **NFC 卡片**：將網址寫入 NFC 卡片，靠近手機即可開啟
3. **QR 碼**：掃描 QR 碼開啟網頁
4. **下載聯絡人**：點擊「加入聯絡人」按鈕下載 .vcf 檔案

## 🔧 自訂設定

1. 替換 `assets/photo.png` 為您的頭像
2. 修改 `index.html` 中的個人資訊
3. 更新 `.vcf` 檔案中的聯絡資訊

## 📧 聯絡資訊

如有問題或建議，歡迎開啟 Issue 或 Pull Request。