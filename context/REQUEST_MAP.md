# REQUEST MAP

| Source | Intent | Owner | Artifacts | CodeRefs |
|---|---|---|---|---|
| commit proposal | Fix XSS in avatar URL | Security Team | index1.html:666, assets/security-utils.js | SecurityUtils.setSecureAttribute |
| context audit | Maintain project context | Dev Team | context/*.md | context engineering workflow |
| security review | Validate SecurityUtils infrastructure | Dev Team | assets/security-utils.js:260-283 | setSecureAttribute, validateURL |
| commit proposal | Add allowedOrigins whitelist for avatars | Security Team | 8 HTML files with avatar.src | SecurityUtils allowedOrigins parameter |
| feat proposal | Add Google Drive URL support for avatars | Dev Team | nfc-generator*.html | convertGoogleDriveUrl function |