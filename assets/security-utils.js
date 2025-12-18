/**
 * NFC Digital Business Card - Security Utilities
 * 核心安全模組，用於修補DOM XSS和Open Redirect弱點
 * 
 * @version 1.0.0
 * @author Amazon Q Developer CLI
 */

(function(window) {
    'use strict';

    /**
     * 允許的地圖服務網域白名單
     * 用於驗證地圖連結的安全性，防止 Open Redirect 攻擊
     */
    const ALLOWED_MAP_DOMAINS = [
        'https://www.google.com',
        'https://maps.google.com',
        'https://maps.app.goo.gl'
    ];
    const GOOGLE_MAPS_SHARE_BASE = 'https://maps.app.goo.gl';

    /**
     * 允許的社群媒體網域白名單
     * 用於驗證社群連結的安全性，防止 Open Redirect 攻擊
     */
    const ALLOWED_SOCIAL_DOMAINS = [
        'https://facebook.com',
        'https://www.facebook.com',
        'https://m.facebook.com',
        'https://fb.com',
        'https://www.fb.com',
        'https://instagram.com',
        'https://www.instagram.com',
        'https://m.instagram.com',
        'https://line.me',
        'https://github.com',
        'https://www.github.com',
        'https://twitter.com',
        'https://www.twitter.com',
        'https://m.twitter.com',
        'https://x.com',
        'https://www.x.com',
        'https://linkedin.com',
        'https://www.linkedin.com',
        'https://m.linkedin.com',
        'https://youtube.com',
        'https://www.youtube.com',
        'https://m.youtube.com',
        'https://youtu.be',
        'https://discord.gg',
        'https://discord.com',
        'https://www.discord.com'
    ];

    function encodeBinaryString(bytes) {
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, chunk);
        }
        return binary;
    }

    const SecurityUtils = {

        // 公開網域白名單常數
        ALLOWED_MAP_DOMAINS: ALLOWED_MAP_DOMAINS,
        ALLOWED_SOCIAL_DOMAINS: ALLOWED_SOCIAL_DOMAINS,
        GOOGLE_MAPS_SHARE_BASE: GOOGLE_MAPS_SHARE_BASE,

        /**
         * Base64 編碼（支援 UTF-8 字元）
         * @param {string} value - 欲編碼的文字
         * @returns {string} Base64 字串或空字串（失敗時）
         */
        base64Encode: function(value) {
            try {
                const encoder = new TextEncoder();
                const bytes = encoder.encode(value);
                return btoa(encodeBinaryString(bytes));
            } catch (error) {
                this.logSecurityEvent('base64Encode', 'Primary encoder failed', { error: error.message });
                try {
                    return btoa(unescape(encodeURIComponent(value)));
                } catch (fallbackError) {
                    this.logSecurityEvent('base64Encode', 'Fallback encoder failed', { error: fallbackError.message });
                    return '';
                }
            }
        },

        /**
         * Base64 解碼（支援 UTF-8 字元）
         * @param {string} value - Base64 字串
         * @returns {string} 解碼後的文字或空字串（失敗時）
         */
        base64Decode: function(value) {
            try {
                const binary = atob(value);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                const decoder = new TextDecoder();
                return decoder.decode(bytes);
            } catch (error) {
                this.logSecurityEvent('base64Decode', 'Primary decoder failed', { error: error.message });
                try {
                    return decodeURIComponent(escape(atob(value)));
                } catch (fallbackError) {
                    this.logSecurityEvent('base64Decode', 'Fallback decoder failed', { error: fallbackError.message });
                    return '';
                }
            }
        },

        /**
         * Base64 URL-safe 編碼
         * @param {string} value - 欲編碼的文字
         * @returns {string} URL 可用的 Base64 字串
         */
        base64UrlEncode: function(value) {
            const encoded = this.base64Encode(value);
            if (!encoded) {
                return '';
            }
            return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
        },

        /**
         * Base64 URL-safe 解碼
         * @param {string} value - URL-safe Base64 字串
         * @returns {string} 解碼後的文字或空字串
         */
        base64UrlDecode: function(value) {
            if (!value || typeof value !== 'string') {
                return '';
            }
            const padding = '='.repeat((4 - value.length % 4) % 4);
            const normalized = value.replace(/-/g, '+').replace(/_/g, '/') + padding;
            return this.base64Decode(normalized);
        },

        /**
         * 輸入驗證 - 清理和驗證用戶輸入
         * @param {string} input - 待驗證的輸入
         * @param {string} type - 驗證類型 ('text', 'email', 'url', 'phone')
         * @returns {string} 清理後的安全輸入
         */
        sanitizeInput: function(input, type = 'text') {
            if (typeof input !== 'string') return '';
            
            // 基礎HTML實體編碼
            const htmlEscape = input
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
            
            switch (type) {
                case 'email':
                    // 允許 email 中的 + 號
                    return htmlEscape.replace(/[^\w@.\-+]/g, '');
                case 'phone':
                    return htmlEscape.replace(/[^\d\s\-\+\(\)]/g, '');
                case 'url':
                    // URL 不應該在這裡處理，因為會破壞格式
                    // 直接返回原始值，讓 validateURL 來處理
                    return input;
                default:
                    return htmlEscape;
            }
        },

        /**
         * 安全渲染 - 安全地將內容渲染到DOM
         * @param {HTMLElement} element - 目標DOM元素
         * @param {string} content - 要渲染的內容
         * @param {boolean} allowHTML - 是否允許HTML（預設false）
         */
        safeRender: function(element, content, allowHTML = false) {
            try {
                if (!element || typeof content !== 'string') {
                    this.logSecurityEvent('safeRender', 'Invalid parameters', { element: !!element, content: typeof content });
                    return;
                }
                
                if (allowHTML) {
                    // 如果允許HTML，使用白名單過濾
                    const cleanContent = this.sanitizeHTML(content);
                    element.innerHTML = cleanContent;
                } else {
                    // 純文字渲染
                    element.textContent = content;
                }
            } catch (error) {
                this.logSecurityEvent('safeRender', 'Rendering error', { error: error.message });
                // 降級處理：使用純文字
                if (element) {
                    element.textContent = typeof content === 'string' ? content : '';
                }
            }
        },

        /**
         * HTML白名單清理 - 使用 DOMPurify 進行安全過濾
         * @param {string} html - 待清理的HTML
         * @returns {string} 清理後的安全HTML
         */
        sanitizeHTML: function(html) {
            // 檢查 DOMPurify 是否可用
            if (typeof DOMPurify !== 'undefined') {
                // 使用 DOMPurify 進行安全清理
                return DOMPurify.sanitize(html, {
                    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br', 'a'],
                    ALLOWED_ATTR: ['class', 'href'],
                    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:)/i,
                    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
                    FORBID_ATTR: ['onclick', 'onerror', 'onload'],
                    KEEP_CONTENT: true,
                    RETURN_DOM: false
                });
            } else {
                // 降級到基礎 HTML 實體編碼（如果 DOMPurify 未載入）
                this.logSecurityEvent('sanitizeHTML', 'DOMPurify not available, using fallback', { html: html.substring(0, 50) });
                return this.sanitizeInput(html, 'text');
            }
        },

        /**
         * Google Drive 主機名驗證
         * @param {string} url - 待驗證的URL
         * @returns {boolean} 是否為 Google Drive 主機
         */
        isGoogleDriveHostname: function(url) {
            try {
                const urlObj = new URL(url);
                return urlObj.hostname === 'drive.google.com' || 
                       urlObj.hostname === 'docs.google.com';
            } catch (e) {
                this.logSecurityEvent('isGoogleDriveHostname', 'URL parsing failed', { url, error: e.message });
                return false;
            }
        },

        /**
         * URL驗證 - 驗證URL安全性
         * @param {string} url - 待驗證的URL
         * @param {Array} allowedOrigins - 允許的來源白名單（可選，用於防止 Open Redirect）
         * @returns {boolean} 是否為安全URL
         */
        validateURL: function(url, allowedOrigins = []) {
            try {
                if (typeof url !== 'string' || !url.trim()) {
                    this.logSecurityEvent('validateURL', 'Invalid URL format', { url: typeof url });
                    return false;
                }
                
                // 檢查是否包含危險字元或腳本
                if (url.toLowerCase().includes('javascript:') || url.toLowerCase().includes('data:')) {
                    this.logSecurityEvent('validateURL', 'Blocked dangerous scheme in string', { url: url.substring(0, 50) });
                    return false;
                }

                const urlObj = new URL(url);
                
                // 允許的協議白名單
                const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
                if (!allowedProtocols.includes(urlObj.protocol)) {
                    this.logSecurityEvent('validateURL', 'Blocked protocol', { protocol: urlObj.protocol, url: url });
                    return false;
                }
                
                // Open Redirect 防護：檢查 Origin 白名單（僅對 http/https 協議）
                if (['http:', 'https:'].includes(urlObj.protocol)) {
                    // 預設允許當前網站的 origin
                    const defaultAllowed = [window.location.origin];
                    
                    // 合併允許的來源：當前 origin + 傳入的 whitelist + 地圖與社群預設 whitelist
                    const combinedAllowed = [...new Set([
                        ...defaultAllowed, 
                        ...allowedOrigins,
                        ...ALLOWED_MAP_DOMAINS,
                        ...ALLOWED_SOCIAL_DOMAINS
                    ])];
                    
                    if (!combinedAllowed.includes(urlObj.origin)) {
                        this.logSecurityEvent('validateURL', 'Cross-origin URL blocked', { 
                            origin: urlObj.origin, 
                            allowedCount: combinedAllowed.length 
                        });
                        return false;
                    }
                }
                
                return true;
            } catch (error) {
                this.logSecurityEvent('validateURL', 'URL parsing error', { error: error.message, url: url });
                return false;
            }
        },

        /**
         * 地圖URL驗證 - 專門驗證地圖服務URL的安全性
         * @param {string} url - 待驗證的地圖URL
         * @returns {boolean} 是否為安全的地圖URL
         */
        validateMapURL: function(url) {
            try {
                // 基礎驗證：空值檢查
                if (typeof url !== 'string' || !url.trim()) {
                    this.logSecurityEvent('validateMapURL', 'Invalid URL format', { url: typeof url });
                    return false;
                }

                const urlObj = new URL(url);

                // 協議必須是 https（地圖服務應使用安全連線）
                if (urlObj.protocol !== 'https:') {
                    this.logSecurityEvent('validateMapURL', 'Blocked non-HTTPS protocol', {
                        protocol: urlObj.protocol,
                        url: url
                    });
                    return false;
                }

                // 檢查 origin 是否在地圖網域白名單中
                const isAllowed = ALLOWED_MAP_DOMAINS.includes(urlObj.origin);

                if (!isAllowed) {
                    this.logSecurityEvent('validateMapURL', 'Map domain not in whitelist', {
                        origin: urlObj.origin,
                        allowed: ALLOWED_MAP_DOMAINS
                    });
                    return false;
                }

                // 額外的安全檢查：防止 XSS payload 在 URL 中
                const suspiciousPatterns = [
                    /<script/i,
                    /javascript:/i,
                    /on\w+\s*=/i,  // onerror=, onclick=, etc.
                    /<iframe/i
                ];

                for (const pattern of suspiciousPatterns) {
                    if (pattern.test(url)) {
                        this.logSecurityEvent('validateMapURL', 'Suspicious pattern detected in URL', {
                            url: url,
                            pattern: pattern.toString()
                        });
                        return false;
                    }
                }

                return true;
            } catch (error) {
                this.logSecurityEvent('validateMapURL', 'URL parsing error', {
                    error: error.message,
                    url: url
                });
                return false;
            }
        },

        /**
         * 驗證 Google Maps ID 格式
         * @param {string} mapId - Google Maps 分享連結 ID
         * @returns {boolean} 是否為有效的 Google Maps ID
         */
        validateGoogleMapsId: function(mapId) {
            if (!mapId || typeof mapId !== 'string') {
                return false;
            }

            const trimmed = mapId.trim();

            // Google Maps ID 格式：僅允許英數字，長度通常為 10-25 字元
            const isValid = /^[a-zA-Z0-9]{10,25}$/.test(trimmed);

            if (!isValid) {
                this.logSecurityEvent('validateGoogleMapsId', 'Invalid Google Maps ID format', {
                    mapId: trimmed
                });
            }

            return isValid;
        },

        /**
         * 規範化座標值，限制數值範圍與小數精度
         * @param {number|string} value - 原始座標值
         * @param {'lat'|'lng'} type - 座標類型
         * @param {number} decimals - 保留的小數位數
         * @returns {number|null} 規範化後的座標，失敗時返回 null
         */
        normalizeCoordinate: function(value, type = 'lat', decimals = 6) {
            if (value === null || value === undefined || value === '') {
                return null;
            }

            const limit = type === 'lng' ? 180 : 90;
            const numeric = typeof value === 'number' ? value : parseFloat(String(value).trim());

            if (!Number.isFinite(numeric)) {
                this.logSecurityEvent('normalizeCoordinate', 'Non-numeric coordinate rejected', {
                    value: value,
                    type: type
                });
                return null;
            }

            if (Math.abs(numeric) > limit) {
                this.logSecurityEvent('normalizeCoordinate', 'Coordinate out of range', {
                    value: numeric,
                    type: type,
                    limit: limit
                });
                return null;
            }

            const clampedDecimals = Number.isInteger(decimals) && decimals >= 0 && decimals <= 10 ? decimals : 6;
            const normalized = parseFloat(numeric.toFixed(clampedDecimals));

            if (!Number.isFinite(normalized)) {
                this.logSecurityEvent('normalizeCoordinate', 'Failed to normalize coordinate', {
                    value: numeric,
                    type: type
                });
                return null;
            }

            return normalized;
        },

        /**
         * 從分享連結或 ID 中提取並驗證 Google Maps ID
         * @param {string} input - 分享連結或 ID
         * @returns {string} 驗證後的 Google Maps ID，失敗時返回空字串
         */
        normalizeGoogleMapsId: function(input) {
            if (typeof input !== 'string') {
                return '';
            }

            const trimmed = input.trim();
            if (!trimmed) {
                return '';
            }

            const pattern = /(?:https?:\/\/)?(?:www\.)?maps\.app\.goo\.gl\/([a-zA-Z0-9]+)/i;
            const match = trimmed.match(pattern);
            const candidate = match && match[1] ? match[1] : trimmed;

            if (!this.validateGoogleMapsId(candidate)) {
                return '';
            }

            return candidate;
        },

        /**
         * 建立 Google Maps 分享連結
         * @param {string} mapId - 已驗證的 Google Maps ID
         * @returns {string} 安全的分享連結或空字串
         */
        createGoogleMapsShareUrl: function(mapId) {
            if (!this.validateGoogleMapsId(mapId)) {
                return '';
            }

            const shareUrl = `${GOOGLE_MAPS_SHARE_BASE}/${mapId}`;
            return this.validateMapURL(shareUrl) ? shareUrl : '';
        },

        /**
         * 建立座標導向的 Google Maps 連結
         * @param {number|string} lat - 緯度
         * @param {number|string} lng - 經度
         * @returns {string} 安全的地圖連結或空字串
         */
        createMapUrlFromCoords: function(lat, lng) {
            const normalizedLat = this.normalizeCoordinate(lat, 'lat');
            const normalizedLng = this.normalizeCoordinate(lng, 'lng');

            if (normalizedLat === null || normalizedLng === null) {
                return '';
            }

            const url = `https://www.google.com/maps?q=${normalizedLat},${normalizedLng}`;
            return this.validateMapURL(url) ? url : '';
        },

        /**
         * 安全的URL參數解析
         * @param {string} paramName - 參數名稱
         * @returns {string} 清理後的參數值
         */
        getSecureURLParam: function(paramName, options = {}) {
            const { sanitize = true } = options;
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const value = urlParams.get(paramName);
                if (!value) {
                    return '';
                }
                return sanitize ? this.sanitizeInput(value) : value;
            } catch (error) {
                this.logSecurityEvent('getSecureURLParam', 'Parameter parsing error', { 
                    param: paramName, 
                    error: error.message 
                });
                return '';
            }
        },

        /**
         * 安全事件日誌記錄
         * @param {string} function_name - 函數名稱
         * @param {string} event - 事件描述
         * @param {object} details - 詳細資訊
         */
        logSecurityEvent: function(function_name, event, details = {}) {
            const timestamp = new Date().toISOString();
            const stack = new Error().stack;
            
            const logEntry = {
                timestamp: timestamp,
                function: function_name,
                event: event,
                details: details,
                userAgent: navigator.userAgent.substring(0, 100) // 限制長度
            };
            
            // 增強的調試輸出
            console.warn('[SECURITY]', timestamp, '-', function_name + ':', event);
            console.warn('[SECURITY] Details:', details);
            console.warn('[SECURITY] Call Stack:', stack.split('\n').slice(1, 4)); // 只顯示前3層堆疊
            
            // 開發環境：輸出到控制台
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.warn('[SecurityUtils]', logEntry);
            }
            
            // 生產環境：可以發送到監控服務（此處僅記錄到 sessionStorage）
            try {
                const logs = JSON.parse(sessionStorage.getItem('securityLogs') || '[]');
                logs.push(logEntry);
                // 保持最近100條記錄
                if (logs.length > 100) {
                    logs.splice(0, logs.length - 100);
                }
                sessionStorage.setItem('securityLogs', JSON.stringify(logs));
            } catch (e) {
                // 靜默失敗，不影響主要功能
            }
        },

        /**
         * 獲取安全事件日誌
         * @returns {Array} 安全事件日誌陣列
         */
        getSecurityLogs: function() {
            try {
                return JSON.parse(sessionStorage.getItem('securityLogs') || '[]');
            } catch (e) {
                return [];
            }
        },

        /**
         * 清除安全事件日誌
         */
        clearSecurityLogs: function() {
            try {
                sessionStorage.removeItem('securityLogs');
            } catch (e) {
                // 靜默失敗
            }
        },

        /**
         * 創建安全的URL（帶有空值處理）
         * @param {string} url - 待處理的URL
         * @param {Array} allowedOrigins - 允許的來源列表
         * @returns {string|null} 安全的URL或null（如果無效）
         */
        createSafeURL: function(url, allowedOrigins = []) {
            // Handle empty/null/undefined values
            if (!url || typeof url !== 'string' || !url.trim()) {
                this.logSecurityEvent('createSafeURL', 'Empty URL provided', { url: typeof url });
                return null;
            }

            // Validate URL
            if (this.validateURL(url, allowedOrigins)) {
                return url;
            } else {
                this.logSecurityEvent('createSafeURL', 'Invalid URL rejected', { url });
                return null;
            }
        },

        /**
         * 安全的屬性設置
         * @param {HTMLElement} element - 目標元素
         * @param {string} attribute - 屬性名稱
         * @param {string} value - 屬性值
         * @param {Array} allowedOrigins - 允許的來源列表（可選）
         */
        setSecureAttribute: function(element, attribute, value, allowedOrigins = []) {
            if (!element || typeof attribute !== 'string') return;

            // Handle empty/null values - remove attribute instead
            if (!value || typeof value !== 'string' || !value.trim()) {
                element.removeAttribute(attribute);
                if (attribute.toLowerCase() === 'href') {
                    element.setAttribute('aria-disabled', 'true');
                }
                return;
            }

            // 對 href, src 等 URL 屬性進行特殊處理
            if (attribute.toLowerCase() === 'href' || attribute.toLowerCase() === 'src') {
                // 1. 直接驗證原始值（不先編碼）
                if (this.validateURL(value, allowedOrigins)) {
                    element.setAttribute(attribute, value);
                } else {
                    // 如果驗證失敗，記錄事件並設置安全的預設值
                    this.logSecurityEvent('setSecureAttribute', 'Invalid URL blocked', { attribute, value });
                    if (attribute.toLowerCase() === 'href') {
                        element.removeAttribute('href');
                        element.setAttribute('aria-disabled', 'true');
                    } else {
                        element.setAttribute(attribute, '#');
                    }
                }
            } else {
                // 2. 對於其他屬性，進行 HTML 實體編碼後設置
                const safeValue = this.sanitizeInput(value, 'text');
                element.setAttribute(attribute, safeValue);
            }
        }
    };

    // 全域暴露
    window.SecurityUtils = SecurityUtils;

})(window);
