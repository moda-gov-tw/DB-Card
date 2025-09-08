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
         * HTML白名單清理 - 加強版安全過濾
         * @param {string} html - 待清理的HTML
         * @returns {string} 清理後的安全HTML
         */
        sanitizeHTML: function(html) {
            const allowedTags = ['b', 'i', 'em', 'strong', 'span', 'br'];
            const allowedAttrs = ['class'];
            
            // 第一階段：移除所有危險標籤和屬性
            let cleaned = html
                // 移除所有腳本相關標籤
                .replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
                .replace(/<object[^>]*>.*?<\/object>/gi, '')
                .replace(/<embed[^>]*>/gi, '')
                .replace(/<applet[^>]*>.*?<\/applet>/gi, '')
                .replace(/<form[^>]*>.*?<\/form>/gi, '')
                .replace(/<input[^>]*>/gi, '')
                .replace(/<textarea[^>]*>.*?<\/textarea>/gi, '')
                .replace(/<select[^>]*>.*?<\/select>/gi, '')
                .replace(/<button[^>]*>.*?<\/button>/gi, '')
                .replace(/<a[^>]*>.*?<\/a>/gi, '')
                // 移除可能執行腳本的標籤
                .replace(/<svg[^>]*>.*?<\/svg>/gi, '')
                .replace(/<math[^>]*>.*?<\/math>/gi, '')
                .replace(/<img[^>]*>/gi, '')
                .replace(/<video[^>]*>.*?<\/video>/gi, '')
                .replace(/<audio[^>]*>.*?<\/audio>/gi, '')
                .replace(/<canvas[^>]*>.*?<\/canvas>/gi, '')
                .replace(/<details[^>]*>.*?<\/details>/gi, '')
                .replace(/<summary[^>]*>.*?<\/summary>/gi, '')
                .replace(/<style[^>]*>.*?<\/style>/gi, '')
                .replace(/<link[^>]*>/gi, '')
                .replace(/<meta[^>]*>/gi, '')
                .replace(/<base[^>]*>/gi, '');
            
            // 第二階段：移除所有事件處理器和危險協議
            cleaned = cleaned
                .replace(/\son\w+\s*=\s*[^>\s]*/gi, '')
                .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/vbscript:/gi, '')
                .replace(/data:/gi, '')
                .replace(/href\s*=\s*["'][^"']*javascript[^"']*["']/gi, '')
                .replace(/href\s*=\s*["'][^"']*vbscript[^"']*["']/gi, '')
                .replace(/href\s*=\s*["'][^"']*data[^"']*["']/gi, '');
            
            // 第三階段：白名單標籤過濾 - 只保留安全的標籤
            const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
            cleaned = cleaned.replace(tagRegex, (match, tagName) => {
                if (allowedTags.includes(tagName.toLowerCase())) {
                    // 對於允許的標籤，移除所有屬性（除了 span 的 class）
                    if (tagName.toLowerCase() === 'span') {
                        const classMatch = match.match(/class\s*=\s*["']([^"']*)["']/i);
                        if (classMatch && /^[a-zA-Z0-9\s\-_]+$/.test(classMatch[1])) {
                            return match.startsWith('</') ? `</${tagName}>` : `<${tagName} class="${classMatch[1]}">`;
                        }
                    }
                    return match.startsWith('</') ? `</${tagName}>` : `<${tagName}>`;
                }
                return ''; // 移除不在白名單中的標籤
            });
            
            return cleaned;
        },

        /**
         * URL驗證 - 驗證URL安全性
         * @param {string} url - 待驗證的URL
         * @returns {boolean} 是否為安全URL
         */
        validateURL: function(url) {
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
                
                // 防止javascript:和data:協議
                if (urlObj.protocol === 'javascript:' || urlObj.protocol === 'data:') {
                    this.logSecurityEvent('validateURL', 'Dangerous protocol blocked', { protocol: urlObj.protocol });
                    return false;
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
            const logEntry = {
                timestamp: timestamp,
                function: function_name,
                event: event,
                details: details,
                userAgent: navigator.userAgent.substring(0, 100) // 限制長度
            };
            
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
         */
        setSecureAttribute: function(element, attribute, value) {
            if (!element || typeof attribute !== 'string' || typeof value !== 'string') return;
            
            // 對 href, src 等 URL 屬性進行特殊處理
            if (attribute.toLowerCase() === 'href' || attribute.toLowerCase() === 'src') {
                // 1. 直接驗證原始值（不先編碼）
                if (this.validateURL(value)) {
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
