/**
 * NFC Digital Business Card - Security Utilities
 * 核心安全模組，用於修補DOM XSS和Open Redirect弱點
 * 
 * @version 1.0.0
 * @author Amazon Q Developer CLI
 */

(function(window) {
    'use strict';

    const SecurityUtils = {
        
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
         * URL驗證 - 驗證URL安全性
         * @param {string} url - 待驗證的URL
         * @param {Array} allowedOrigins - 允許的來源白名單（可選，用於防止 Open Redirect）
         * @returns {boolean} 是否為安全URL
         */
        validateURL: function(url, allowedOrigins = []) {
            // 調試日誌：記錄所有調用
            console.log('[DEBUG] validateURL called with:', { 
                url: url, 
                allowedOrigins: allowedOrigins.length,
                origins: allowedOrigins.slice(0, 3) // 只顯示前3個避免日誌過長
            });
            
            try {
                if (typeof url !== 'string' || !url.trim()) {
                    this.logSecurityEvent('validateURL', 'Invalid URL format', { url: typeof url });
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
                if (allowedOrigins.length > 0 && ['http:', 'https:'].includes(urlObj.protocol)) {
                    // 預設允許當前網站的 origin
                    const defaultAllowed = [window.location.origin];
                    const combinedAllowed = [...new Set([...defaultAllowed, ...allowedOrigins])];
                    
                    if (!combinedAllowed.includes(urlObj.origin)) {
                        this.logSecurityEvent('validateURL', 'Cross-origin URL blocked', { 
                            origin: urlObj.origin, 
                            allowed: combinedAllowed 
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
         * 安全的URL參數解析
         * @param {string} paramName - 參數名稱
         * @returns {string} 清理後的參數值
         */
        getSecureURLParam: function(paramName) {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const value = urlParams.get(paramName);
                return value ? this.sanitizeInput(value) : '';
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
         * 安全的屬性設置
         * @param {HTMLElement} element - 目標元素
         * @param {string} attribute - 屬性名稱
         * @param {string} value - 屬性值
         * @param {Array} allowedOrigins - 允許的來源列表（可選）
         */
        setSecureAttribute: function(element, attribute, value, allowedOrigins = []) {
            if (!element || typeof attribute !== 'string' || typeof value !== 'string') return;
            
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
