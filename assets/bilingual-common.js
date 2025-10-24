/**
 * 雙語 NFC 數位名片核心函數庫
 * 提供編碼優化、雙語解析、語言切換等核心功能
 */

// SecurityUtils 載入驗證
if (typeof SecurityUtils === 'undefined') {
    console.warn('SecurityUtils not loaded. Security features disabled.');
}

// 統一 SecurityUtils 檢查模式
const safeSetAttribute = (el, attr, val, origins) => {
    if (!el || !attr) {
        return false;
    }

    if (typeof SecurityUtils !== 'undefined' && typeof SecurityUtils.setSecureAttribute === 'function') {
        SecurityUtils.setSecureAttribute(el, attr, val, origins);
        return true;
    }

    console.error('SecurityUtils required');
    return false;
};

const logSecurityEvent = (functionName, message, details = {}) => {
    if (typeof SecurityUtils !== 'undefined' && typeof SecurityUtils.logSecurityEvent === 'function') {
        SecurityUtils.logSecurityEvent(functionName, message, details);
    }
};

const base64Helper = (() => {
    const hasSecurityUtils = typeof SecurityUtils !== 'undefined' &&
        typeof SecurityUtils.base64UrlEncode === 'function' &&
        typeof SecurityUtils.base64UrlDecode === 'function';

    const fallbackEncode = (value) => {
        try {
            return btoa(unescape(encodeURIComponent(value)))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/g, '');
        } catch (error) {
            logSecurityEvent('base64FallbackEncode', 'Encoding failed', { error: error.message });
            return '';
        }
    };

    const fallbackDecode = (value) => {
        try {
            const padding = '='.repeat((4 - value.length % 4) % 4);
            const normalized = value.replace(/-/g, '+').replace(/_/g, '/') + padding;
            return decodeURIComponent(escape(atob(normalized)));
        } catch (error) {
            logSecurityEvent('base64FallbackDecode', 'Decoding failed', { error: error.message });
            return null;
        }
    };

    return {
        encode(value) {
            if (hasSecurityUtils) {
                return SecurityUtils.base64UrlEncode(value);
            }
            return fallbackEncode(value);
        },
        decode(value) {
            if (hasSecurityUtils) {
                return SecurityUtils.base64UrlDecode(value);
            }
            return fallbackDecode(value);
        }
    };
})();

const PREFERRED_LANGUAGE_KEY = 'preferredLanguage';

const MAP_BASE_URL = 'https://www.google.com/maps';
const GOOGLE_MAPS_SHARE_BASE = 'https://maps.app.goo.gl';
const LOCATION_LABEL_MAX_LENGTH = 80;

const sanitizeCoordinateValue = (value, type = 'lat') => {
    if (typeof SecurityUtils !== 'undefined' && typeof SecurityUtils.normalizeCoordinate === 'function') {
        const normalized = SecurityUtils.normalizeCoordinate(value, type, 6);
        return typeof normalized === 'number' ? normalized : null;
    }

    if (value === null || value === undefined || value === '') {
        return null;
    }

    const numeric = typeof value === 'number' ? value : parseFloat(String(value).trim());
    if (!Number.isFinite(numeric)) {
        return null;
    }

    const limit = type === 'lng' ? 180 : 90;
    if (Math.abs(numeric) > limit) {
        return null;
    }

    return parseFloat(numeric.toFixed(6));
};

const sanitizeLocationLabel = (label) => {
    if (typeof label !== 'string') {
        return '';
    }

    const normalized = label.replace(/\s+/g, ' ').trim();
    if (!normalized) {
        return '';
    }

    return normalized.slice(0, LOCATION_LABEL_MAX_LENGTH);
};

const normalizeMapId = (value) => {
    if (typeof SecurityUtils !== 'undefined' && typeof SecurityUtils.normalizeGoogleMapsId === 'function') {
        return SecurityUtils.normalizeGoogleMapsId(value);
    }

    if (typeof value !== 'string') {
        return '';
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return '';
    }

    const pattern = /(?:https?:\/\/)?(?:www\.)?maps\.app\.goo\.gl\/([a-zA-Z0-9]+)/i;
    const match = trimmed.match(pattern);
    const candidate = match && match[1] ? match[1] : trimmed;
    return /^[a-zA-Z0-9]{10,25}$/.test(candidate) ? candidate : '';
};

const buildShareUrlFromMapId = (mapId) => {
    if (!mapId) {
        return '';
    }

    if (typeof SecurityUtils !== 'undefined' && typeof SecurityUtils.createGoogleMapsShareUrl === 'function') {
        return SecurityUtils.createGoogleMapsShareUrl(mapId);
    }

    const shareUrl = `${GOOGLE_MAPS_SHARE_BASE}/${mapId}`;
    if (typeof SecurityUtils !== 'undefined' && typeof SecurityUtils.validateMapURL === 'function') {
        return SecurityUtils.validateMapURL(shareUrl) ? shareUrl : '';
    }

    return shareUrl;
};

const buildCoordsMapUrl = (lat, lng) => {
    if (typeof SecurityUtils !== 'undefined' && typeof SecurityUtils.createMapUrlFromCoords === 'function') {
        return SecurityUtils.createMapUrlFromCoords(lat, lng);
    }

    const safeLat = sanitizeCoordinateValue(lat, 'lat');
    const safeLng = sanitizeCoordinateValue(lng, 'lng');
    if (safeLat === null || safeLng === null) {
        return '';
    }

    const url = `${MAP_BASE_URL}?q=${safeLat},${safeLng}`;
    if (typeof SecurityUtils !== 'undefined' && typeof SecurityUtils.validateMapURL === 'function') {
        return SecurityUtils.validateMapURL(url) ? url : '';
    }

    return url;
};

/**
 * 從 Google Maps 分享連結中提取 ID
 * @param {string} url - Google Maps 分享連結 (例如: https://maps.app.goo.gl/eKmgu7PqiUfJ2v5D9)
 * @returns {string} 提取的 ID 或空字串
 */
function extractGoogleMapsId(url) {
    const normalized = normalizeMapId(url);
    if (!normalized) {
        logSecurityEvent('extractGoogleMapsId', 'Invalid Google Maps URL or ID', { url });
    }
    return normalized;
}

const ALLOWED_AVATAR_ORIGINS = [
    'https://i.imgur.com',
    'https://imgur.com',
    'https://i.postimg.cc',
    'https://postimages.org',
    'https://github.com',
    'https://raw.githubusercontent.com',
    'https://drive.google.com'
];

const readPreferredLanguage = () => {
    try {
        const stored = window.localStorage?.getItem(PREFERRED_LANGUAGE_KEY);
        if (stored && ['zh', 'en'].includes(stored)) {
            return stored;
        }
    } catch (error) {
        logSecurityEvent('readPreferredLanguage', 'Failed to read language preference', { error: error.message });
    }
    return null;
};

const persistPreferredLanguage = (lang) => {
    if (!['zh', 'en'].includes(lang)) {
        return;
    }
    try {
        window.localStorage?.setItem(PREFERRED_LANGUAGE_KEY, lang);
    } catch (error) {
        logSecurityEvent('persistPreferredLanguage', 'Failed to persist language preference', { error: error.message });
    }
};

const applyDocumentLanguage = (lang) => {
    const normalized = lang === 'en' ? 'en' : 'zh';
    document.documentElement.lang = normalized === 'zh' ? 'zh-TW' : 'en';
    return normalized;
};

const updateAvatar = (avatarUrl) => {
    const avatar = document.getElementById('userAvatar');
    if (!avatar) {
        return;
    }

    if (!avatarUrl || typeof avatarUrl !== 'string') {
        avatar.removeAttribute('src');
        avatar.style.display = 'none';
        return;
    }

    const trimmedUrl = avatarUrl.trim();
    if (!trimmedUrl) {
        avatar.removeAttribute('src');
        avatar.style.display = 'none';
        return;
    }

    const safeDataUrlPattern = /^data:image\/(png|jpe?g|gif|webp);base64,/i;
    if (safeDataUrlPattern.test(trimmedUrl)) {
        avatar.setAttribute('src', trimmedUrl);
        avatar.style.display = 'block';
        avatar.onerror = function() {
            this.removeAttribute('src');
            this.style.display = 'none';
        };
        return;
    }

    if (typeof SecurityUtils === 'undefined') {
        console.warn('Avatar loading disabled: SecurityUtils unavailable');
        avatar.removeAttribute('src');
        avatar.style.display = 'none';
        return;
    }

    const safeAvatarURL = typeof SecurityUtils.createSafeURL === 'function'
        ? SecurityUtils.createSafeURL(trimmedUrl, ALLOWED_AVATAR_ORIGINS)
        : trimmedUrl;

    if (safeAvatarURL && SecurityUtils.validateURL && SecurityUtils.validateURL(safeAvatarURL, ALLOWED_AVATAR_ORIGINS)) {
        safeSetAttribute(avatar, 'src', safeAvatarURL, ALLOWED_AVATAR_ORIGINS);
        avatar.style.display = 'block';
        avatar.onerror = function() {
            this.removeAttribute('src');
            this.style.display = 'none';
        };
    } else {
        logSecurityEvent('updateAvatar', 'Blocked unsafe avatar URL', { attemptedUrl: trimmedUrl });
        avatar.removeAttribute('src');
        avatar.style.display = 'none';
    }
};

// 全域變數
// 偵測瀏覽器語言偏好，預設為中文
function detectBrowserLanguage() {
    // 檢查是否有儲存的使用者偏好
    const savedLang = readPreferredLanguage();
    if (savedLang) {
        return applyDocumentLanguage(savedLang);
    }
    
    // 否則偵測瀏覽器語言
    const userLang = (navigator.language || navigator.userLanguage || navigator.browserLanguage || '').toLowerCase();
    const detectedLang = /^en(-[a-z]{2})?$/.test(userLang) ? 'en' : 'zh';
    logSecurityEvent('detectBrowserLanguage', 'Language detected', { browserLanguage: userLang, resolved: detectedLang });
    
    return applyDocumentLanguage(detectedLang);
}

let currentLanguage = detectBrowserLanguage();
let currentData = null;

/**
 * 緊湊格式編碼 - 優化版本
 */
function encodeCompact(data) {
    // 序列化 location 為壓縮格式: "lat,lng;label" 或 "lat,lng" 或 "label"
    const serializeLocation = (location) => {
        if (!location) return '';

        const parts = [];

        // 處理 Google Maps ID（優先）
        if (location.mapId && typeof location.mapId === 'string' && location.mapId.trim()) {
            parts.push(`mapId:${location.mapId.trim()}`);
        }
        // 處理座標
        else if (location.coords) {
            const lat = sanitizeCoordinateValue(location.coords.lat, 'lat');
            const lng = sanitizeCoordinateValue(location.coords.lng, 'lng');
            if (lat !== null && lng !== null) {
                parts.push(`${lat},${lng}`);
            }
        }

        // 處理標籤
        const cleanedLabel = sanitizeLocationLabel(location.label);
        if (cleanedLabel) {
            parts.push(cleanedLabel);
        }

        return parts.join(';');
    };

    const compact = [
        data.name || '',
        data.title || '',
        data.department || '',
        data.email || '',
        data.phone || '',
        data.mobile || '',
        data.avatar || '',
        (data.greetings || []).join(','),
        data.socialNote || '',
        data.organization || '',
        data.address || '',
        serializeLocation(data.location)
    ].join('|');

    return base64Helper.encode(compact);
}

/**
 * 緊湊格式解碼
 */
function decodeCompact(encoded) {
    try {
        const compactValue = base64Helper.decode(encoded);
        if (compactValue === null) {
            throw new Error('Base64 decode returned null');
        }

        const tryPercentDecode = (value) => {
            if (typeof value !== 'string' || value.indexOf('%') === -1) {
                return null;
            }
            try {
                return decodeURIComponent(value);
            } catch (error) {
                logSecurityEvent('decodeCompact', 'Percent decode failed', { error: error.message });
                return null;
            }
        };

        let compact = compactValue;

        if (compact.indexOf('|') === -1) {
            const percentDecoded = tryPercentDecode(compact);
            if (percentDecoded) {
                const legacyParts = percentDecoded.split('|');
                if (legacyParts.length >= 8) {
                    compact = percentDecoded;
                }
            }
        }

        if (compact === null) {
            throw new Error('Base64 decode returned null');
        }

        const parts = compact.split('|');

        // 檢查是否為舊版本格式（8個欄位，沒有手機號碼）
        if (parts.length === 8) {
            return {
                name: parts[0] || '',
                title: parts[1] || '',
                department: parts[2] || '',
                email: parts[3] || '',
                phone: parts[4] || '',
                mobile: '', // 舊版本沒有手機號碼
                avatar: parts[5] || '',
                greetings: parts[6] ? parts[6].split(',') : [],
                socialNote: parts[7] || '',
                organization: '', // 舊版本沒有組織
                address: '', // 舊版本沒有地址
                location: null // 舊版本沒有位置
            };
        }

        // 9個欄位格式（包含手機號碼，但無組織/地址）
        if (parts.length === 9) {
            return {
                name: parts[0] || '',
                title: parts[1] || '',
                department: parts[2] || '',
                email: parts[3] || '',
                phone: parts[4] || '',
                mobile: parts[5] || '',
                avatar: parts[6] || '',
                greetings: parts[7] ? parts[7].split(',') : [],
                socialNote: parts[8] || '',
                organization: '', // 9欄位版本沒有組織
                address: '', // 9欄位版本沒有地址
                location: null // 9欄位版本沒有位置
            };
        }

        // 11個欄位格式（包含組織和地址，但無位置）
        if (parts.length === 11) {
            return {
                name: parts[0] || '',
                title: parts[1] || '',
                department: parts[2] || '',
                email: parts[3] || '',
                phone: parts[4] || '',
                mobile: parts[5] || '',
                avatar: parts[6] || '',
                greetings: parts[7] ? parts[7].split(',') : [],
                socialNote: parts[8] || '',
                organization: parts[9] || '',
                address: parts[10] || '',
                location: null // 11欄位版本沒有位置
            };
        }

        // 解析 location 欄位（支援 mapId, coords 和 label）
        const parseLocation = (locationStr) => {
            if (!locationStr || !locationStr.trim()) return null;

            try {
                // 格式: "mapId:ID;label" 或 "lat,lng;label" 或 "lat,lng" 或 "label"
                const parts = locationStr.split(';');
                const location = {};

                // 檢查第一部分是否為 Google Maps ID
                if (parts[0] && parts[0].startsWith('mapId:')) {
                    const mapId = parts[0].substring(6).trim(); // 移除 "mapId:" 前綴
                    if (mapId && /^[a-zA-Z0-9]{10,25}$/.test(mapId)) {
                        location.mapId = mapId;
                    }
                    // 如果有第二部分，則為 label
                    if (parts[1]) {
                        const cleanedLabel = sanitizeLocationLabel(parts[1]);
                        if (cleanedLabel) {
                            location.label = cleanedLabel;
                        }
                    }
                }
                // 檢查第一部分是否為座標
                else if (parts[0] && parts[0].includes(',')) {
                    const [rawLat, rawLng] = parts[0].split(',');
                    const lat = sanitizeCoordinateValue(rawLat, 'lat');
                    const lng = sanitizeCoordinateValue(rawLng, 'lng');
                    if (lat !== null && lng !== null) {
                        location.coords = { lat, lng };
                    }
                    // 如果有第二部分，則為 label
                    if (parts[1]) {
                        const cleanedLabel = sanitizeLocationLabel(parts[1]);
                        if (cleanedLabel) {
                            location.label = cleanedLabel;
                        }
                    }
                } else {
                    // 沒有逗號，整個字串為 label
                    const cleanedLabel = sanitizeLocationLabel(locationStr);
                    if (cleanedLabel) {
                        location.label = cleanedLabel;
                    }
                }

                return Object.keys(location).length > 0 ? location : null;
            } catch (error) {
                logSecurityEvent('parseLocation', 'Location parsing error', { error: error.message });
                return null;
            }
        };

        // 新版本格式（12個欄位，包含組織、地址和位置）
        return {
            name: parts[0] || '',
            title: parts[1] || '',
            department: parts[2] || '',
            email: parts[3] || '',
            phone: parts[4] || '',
            mobile: parts[5] || '',
            avatar: parts[6] || '',
            greetings: parts[7] ? parts[7].split(',') : [],
            socialNote: parts[8] || '',
            organization: parts[9] || '',
            address: parts[10] || '',
            location: parseLocation(parts[11])
        };
    } catch (error) {
        logSecurityEvent('decodeCompact', 'Decoding failed', { error: error.message });
        return null;
    }
}

/**
 * 解析雙語字串
 */
function parseBilingual(value) {
    if (!value) return { zh: '', en: '' };
    
    if (value.includes('~')) {
        const [zh, en] = value.split('~').map(s => s.trim());
        return { zh: zh || '', en: en || '' };
    }
    
    return { zh: value, en: value };
}

/**
 * 根據語言獲取文字
 */
function getLocalizedText(value, lang = 'zh') {
    const parsed = parseBilingual(value);
    return lang === 'en' ? parsed.en : parsed.zh;
}

/**
 * 切換語言
 */
function switchLanguage(lang) {
    const normalizedLang = applyDocumentLanguage(lang);
    currentLanguage = normalizedLang;
    persistPreferredLanguage(normalizedLang);

    if (currentData) {
        renderBilingualCard(currentData, normalizedLang);
        updatePageTitle(normalizedLang);
    }

    updateLanguageButton(normalizedLang);

    if (typeof updateUIText === 'function') {
        updateUIText(normalizedLang);
    }
}

/**
 * 更新語言按鈕
 */
function updateLanguageButton(lang) {
    const button = document.getElementById('langSwitch');
    if (button) {
        if (lang === 'zh') {
            button.innerHTML = '<span style="margin-right:4px;">🇺🇸</span> EN';
            button.title = 'Switch to English';
        } else {
            button.innerHTML = '<span style="margin-right:4px;">🇹🇼</span> 中';
            button.title = '切換到中文';
        }
    }
}

/**
 * 更新頁面標題
 */
function updatePageTitle(lang) {
    // 檢查是否為個人版（有自訂組織資訊）
    const isPersonalLayout = currentData && currentData.organization && currentData.organization.trim();

    if (isPersonalLayout) {
        // 個人版：顯示姓名
        const name = currentData ? getLocalizedText(currentData.name, lang) : '';
        document.title = name || (lang === 'zh' ? '數位名片' : 'Digital Business Card');
    } else {
        // 機關版：顯示機關名稱
        const titleMap = {
            zh: '數位名片 - 數位發展部',
            en: 'Digital Business Card - Ministry of Digital Affairs'
        };
        document.title = titleMap[lang] || titleMap.zh;
    }
}

/**
 * 部門翻譯字典
 */
const departmentTranslations = {
    '數位策略司': 'Department of Digital Strategy',
    '數位政府司': 'Department of Digital Service',
    '資源管理司': 'Department of Resource Management', 
    '韌性建設司': 'Department of Communications and Cyber Resilience',
    '數位國際司': 'Department of International Cooperation',
    '資料創新司': 'Department of Data Innovation',
    '秘書處': 'Secretariat',
    '人事處': 'Department of Personnel',
    '政風處': 'Department of Civil Service Ethics',
    '主計處': 'Department of Budget, Accounting and Statistics',
    '資訊處': 'Department of Information Management',
    '法制處': 'Department of Legal Affairs',
    '部長室': "Minister's Office",
    '政務次長室': "Deputy Minister's Office",
    '常務次長室': "Administrative Deputy Minister's Office",
    '主任秘書室': "Chief Secretary's Office"
};

/**
 * 翻譯部門名稱
 */
function translateDepartment(department, lang) {
    if (lang === 'en' && departmentTranslations[department]) {
        return departmentTranslations[department];
    }
    return department;
}

/**
 * 處理雙語問候語
 */
function processBilingualGreetings(greetings, lang) {
    if (!greetings || greetings.length === 0) return ['歡迎認識我！'];
    
    return greetings.map(greeting => getLocalizedText(greeting, lang));
}

/**
 * 渲染雙語名片
 */
function renderBilingualCard(data, lang = 'zh') {
    const name = getLocalizedText(data.name, lang);
    const title = getLocalizedText(data.title, lang);
    const department = translateDepartment(data.department, lang);
    const greetings = processBilingualGreetings(data.greetings, lang);
    
    updateElement('userName', name);
    updateElement('userTitle', title);
    updateElement('userDepartment', department);
    updateElement('userEmail', data.email);
    const emailLink = document.getElementById('userEmail');
    if (emailLink) {
        const rawEmail = typeof data.email === 'string' ? data.email.trim() : '';
        if (rawEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
            const sanitizedEmail = typeof SecurityUtils !== 'undefined' && typeof SecurityUtils.sanitizeInput === 'function'
                ? SecurityUtils.sanitizeInput(rawEmail, 'email')
                : rawEmail;
            safeSetAttribute(emailLink, 'href', `mailto:${sanitizedEmail}`);
            emailLink.removeAttribute('aria-disabled');
        } else {
            emailLink.removeAttribute('href');
            emailLink.setAttribute('aria-disabled', 'true');
        }
    }
    
    // 處理電話顯示
    const phoneItem = document.getElementById('phoneItem');
    if (data.phone) {
        updateElement('userPhone', data.phone);
        const phoneLink = document.getElementById('userPhone');
        if (phoneLink) {
            safeSetAttribute(phoneLink, 'href', `tel:${data.phone.replace(/[^0-9+]/g, '')}`);
        }
        if (phoneItem) phoneItem.style.display = 'flex';
    } else {
        if (phoneItem) phoneItem.style.display = 'none';
    }
    
    // 處理手機號碼顯示
    const mobileItem = document.getElementById('mobileItem');
    if (data.mobile) {
        updateElement('userMobile', data.mobile);
        const mobileLink = document.getElementById('userMobile');
        if (mobileLink) {
            safeSetAttribute(mobileLink, 'href', `tel:${data.mobile.replace(/[^0-9+]/g, '')}`);
        }
        if (mobileItem) mobileItem.style.display = 'flex';
    } else {
        if (mobileItem) mobileItem.style.display = 'none';
    }
    
    if (data.avatar) {
        updateAvatar(data.avatar);
    } else {
        updateAvatar('');
    }
    
    // 更新問候語並重新啟動打字機效果
    if (greetings && greetings.length > 0) {
        window.currentGreetings = greetings;
        window.currentGreetingIndex = 0;
        updateElement('greetings', greetings[0]);
        
        // 重新啟動打字機效果
        if (typeof startGreetingAnimation === 'function') {
            startGreetingAnimation();
        }
    }
    
    // 處理社群媒體資訊
    if (data.socialNote && typeof processSocialLinks === 'function') {
        const socialInfo = document.getElementById('socialInfo');
        const socialContent = document.getElementById('socialInfoContent');
        if (socialInfo && socialContent) {
            while (socialContent.firstChild) {
                socialContent.removeChild(socialContent.firstChild);
            }
            const socialLinks = processSocialLinks(data.socialNote, lang);
            socialContent.appendChild(socialLinks);
            socialInfo.style.display = 'block';
        }
    } else {
        const socialInfo = document.getElementById('socialInfo');
        if (socialInfo) {
            socialInfo.style.display = 'none';
        }
    }

    // 檢查是否為個人版（有自訂組織資訊）
    const isPersonalLayout = data.organization && data.organization.trim();

    // 只有機關版才需要更新組織資訊
    if (!isPersonalLayout) {
        // 檢查是否為新光大樓版本
        const isXinyiBuilding = window.location.pathname.includes('index1-bilingual') ||
                               window.location.pathname.includes('index1.html');
        const building = isXinyiBuilding ? 'xinyi' : 'yanping';

        updateOrganizationInfo(lang, building);
    }
}

/**
 * 更新 DOM 元素
 */
function updateElement(id, content, attr = null, value = null) {
    const element = document.getElementById(id);
    if (element) {
        if (attr && value) {
            element.setAttribute(attr, value);
        } else {
            element.textContent = content;
        }
    }
}

/**
 * 更新組織資訊
 */
function updateOrganizationInfo(lang, building = 'yanping') {
    const orgInfo = {
        zh: {
            name: '數位發展部',
            yanping: '臺北市中正區延平南路143號',
            xinyi: '臺北市中正區忠孝西路一段６６號（１７、１９樓）'
        },
        en: {
            name: 'Ministry of Digital Affairs',
            yanping: '143 Yanping S. Rd., Zhongzheng Dist., Taipei City, Taiwan',
            xinyi: '66 Zhongxiao W. Rd. Sec. 1, Zhongzheng Dist., Taipei City, Taiwan (17F, 19F)'
        }
    };
    
    const info = orgInfo[lang] || orgInfo.zh;
    updateElement('orgName', info.name);
    updateElement('orgAddress', info[building] || info.yanping);
}

/**
 * 轉義 vCard 文字中的特殊字元
 */
function escapeVCardText(text) {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\\\')  // 反斜線
        .replace(/,/g, '\\,')     // 逗號
        .replace(/;/g, '\\;')     // 分號
        .replace(/\n/g, '\\n');   // 換行
}

/**
 * 生成雙語 vCard
 */
function generateBilingualVCard(data, lang = 'zh') {
    const name = getLocalizedText(data.name, lang);
    const title = getLocalizedText(data.title, lang);

    const nameParts = lang === 'zh' && name.length <= 4 ?
        [name.charAt(0), name.slice(1)] :
        name.split(' ');

    // 檢查是否提供自訂組織和地址（個人版）
    let orgName, orgAddress;
    const hasCustomOrganization = data.organization && data.organization.trim();
    const hasCustomAddress = data.address && data.address.trim();

    if (hasCustomOrganization) {
        // 使用自訂組織
        orgName = getLocalizedText(data.organization, lang);
    } else {
        // 使用預設機關資訊
        const orgDefaults = {
            zh: '數位發展部',
            en: 'Ministry of Digital Affairs'
        };
        orgName = orgDefaults[lang] || orgDefaults.zh;
    }

    if (hasCustomAddress) {
        // 使用自訂地址
        orgAddress = getLocalizedText(data.address, lang);
    } else {
        // 使用預設機關地址
        const isXinyiBuilding = window.location.pathname.includes('index1-bilingual') ||
                               window.location.pathname.includes('index1.html');

        const addressDefaults = {
            zh: isXinyiBuilding ?
                '臺北市中正區忠孝西路一段６６號（１７、１９樓）' :
                '臺北市中正區延平南路143號',
            en: isXinyiBuilding ?
                '66 Zhongxiao W. Rd. Sec. 1, Zhongzheng Dist., Taipei City, Taiwan (17F, 19F)' :
                '143 Yanping S. Rd., Zhongzheng Dist., Taipei City, Taiwan'
        };
        orgAddress = addressDefaults[lang] || addressDefaults.zh;
    }

    const department = translateDepartment(data.department, lang);

    // 處理雙語問候語，只保留當前語言
    let greetingNote = '';
    if (data.greetings && data.greetings.length > 0) {
        const localizedGreetings = data.greetings.map(greeting => getLocalizedText(greeting, lang));
        greetingNote = `NOTE;CHARSET=UTF-8:${escapeVCardText(localizedGreetings.join(' '))}`;
    }

    // 處理社群連結資訊
    let socialNote = '';
    if (data.socialNote) {
        const socialText = lang === 'zh' ? '社群連結' : 'Social Links';
        socialNote = `\nNOTE;CHARSET=UTF-8:${socialText}: ${escapeVCardText(data.socialNote.replace(/\n/g, ' | '))}`;
    }

    // 處理位置資訊：使用 GEO 屬性和 location 物件
    let geoLine = '';
    let locationLabel = '';
    let mapUrl = '';
    if (data.location) {
        // 優先處理 Google Maps ID
        if (data.location.mapId && typeof data.location.mapId === 'string' && data.location.mapId.trim()) {
            const mapId = data.location.mapId.trim();
            if (/^[a-zA-Z0-9]{10,25}$/.test(mapId)) {
                mapUrl = `\nURL;TYPE=pref:https://maps.app.goo.gl/${mapId}`;
            }
        }
        // 如果有經緯度座標，使用 GEO 屬性
        else if (data.location.coords &&
            typeof data.location.coords.lat === 'number' &&
            typeof data.location.coords.lng === 'number') {
            geoLine = `GEO:${data.location.coords.lat};${data.location.coords.lng}`;
        }

        // 如果有位置標籤，加入 NOTE
        if (data.location.label && data.location.label.trim()) {
            const locationText = lang === 'zh' ? '位置' : 'Location';
            locationLabel = `\nNOTE;CHARSET=UTF-8:${locationText}: ${escapeVCardText(data.location.label)}`;
        }
    }

    const prodId = lang === 'zh' ?
        'PRODID:-//moda//NFC 數位名片//ZH' :
        'PRODID:-//moda//NFC Digital Business Card//EN';

    const vcard = `BEGIN:VCARD
VERSION:3.0
${prodId}
FN;CHARSET=UTF-8:${escapeVCardText(name)}
N;CHARSET=UTF-8:${escapeVCardText(nameParts[0] || '')};${escapeVCardText(nameParts[1] || '')};;;
${hasCustomOrganization ? `ORG;CHARSET=UTF-8:${escapeVCardText(orgName)};${escapeVCardText(department)}` : ''}
TITLE;CHARSET=UTF-8:${escapeVCardText(title)}
EMAIL;TYPE=work:${data.email || ''}
${data.phone ? `TEL;TYPE=work,voice:${data.phone}` : ''}
${data.mobile ? `TEL;TYPE=cell,voice:${data.mobile}` : ''}
${hasCustomAddress ? `ADR;TYPE=work;CHARSET=UTF-8:;;${escapeVCardText(orgAddress)};;;;Taiwan` : ''}
${geoLine}${mapUrl}
${data.avatar ? `PHOTO;TYPE=JPEG:${data.avatar}` : ''}
${greetingNote}${socialNote}${locationLabel}
REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
END:VCARD`.replace(/\n\n/g, '\n');

    return vcard;
}

/**
 * 下載 vCard
 */
function downloadBilingualVCard(data, lang = 'zh') {
    const vcard = generateBilingualVCard(data, lang);
    const name = getLocalizedText(data.name, lang);
    const filename = `${name.replace(/\s+/g, '_')}_contact.vcf`;
    
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
}

/**
 * 計算容量
 */
function calculateCapacity(data) {
    const encoded = encodeCompact(data);
    return {
        encoded: encoded,
        size: encoded.length,
        remaining: 492 - encoded.length,
        percentage: Math.round((encoded.length / 492) * 100)
    };
}

/**
 * 切換語言（按鈕事件）
 */
function toggleLanguage() {
    const newLang = currentLanguage === 'zh' ? 'en' : 'zh';
    switchLanguage(newLang);
}

/**
 * 初始化頁面
 */
function initializePage() {
    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const data = urlParams.get('data');
        
        if (!data) {
            const loadingState = document.getElementById('loading-state');
            const accessDenied = document.getElementById('access-denied');
            if (loadingState) loadingState.style.display = 'none';
            if (accessDenied) accessDenied.style.display = 'block';
            return;
        }
        
        try {
            currentData = decodeCompact(data);
            if (!currentData || !currentData.name) {
                throw new Error('名片資料格式不正確');
            }
            
            const loadingState = document.getElementById('loading-state');
            const cardContainer = document.getElementById('card-container');
            const accessDenied = document.getElementById('access-denied');
            
            if (loadingState) loadingState.style.display = 'none';
            if (accessDenied) accessDenied.style.display = 'none';
            if (cardContainer) cardContainer.style.display = 'block';
            
            renderBilingualCard(currentData, currentLanguage);
            updateUIText(currentLanguage);
            updateLanguageButton(currentLanguage);
            
            // 生成 QR 碼
            if (typeof generateQRCode === 'function') {
                generateQRCode();
            }
            
            updateAvatar(currentData.avatar);
            
            // 處理社群資訊
            if (currentData.socialNote && typeof processSocialLinks === 'function') {
                const socialInfo = document.getElementById('socialInfo');
                const socialContent = document.getElementById('socialInfoContent');
                if (socialInfo && socialContent) {
                    while (socialContent.firstChild) {
                        socialContent.removeChild(socialContent.firstChild);
                    }
                    const socialLinks = processSocialLinks(currentData.socialNote, currentLanguage);
                    socialContent.appendChild(socialLinks);
                    socialInfo.style.display = 'block';
                }
            }
            
            // 啟動問候語動畫
            setTimeout(() => {
                if (typeof startGreetingAnimation === 'function') {
                    startGreetingAnimation();
                }
            }, 1000);
            
        } catch (error) {
            console.error('解析失敗:', error);
            const loadingState = document.getElementById('loading-state');
            const accessDenied = document.getElementById('access-denied');
            if (loadingState) loadingState.style.display = 'none';
            if (accessDenied) accessDenied.style.display = 'block';
        }
        
        // 確保語言按鈕與偵測到的語言同步
        updateLanguageButton(currentLanguage);
    }, 800);
}

/**
 * 安全創建社群連結元素
 */
function createSocialElement(platform, url, buttonText, brandColor, displayUrl = '') {
    const container = document.createElement('div');
    container.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 8px; margin: 6px 0;';
    
    const label = document.createElement('span');
    label.style.cssText = `color: ${brandColor}; font-weight: 500;`;
    label.textContent = platform + (displayUrl ? `: ${displayUrl}` : '');
    
    const link = document.createElement('a');
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'social-link';
    link.style.cssText = `background: ${brandColor}; color: white; padding: 4px 12px; border-radius: 16px; text-decoration: none; font-size: 0.85em; font-weight: 500;`;
    link.textContent = buttonText;
    
    // 安全URL驗證 - 修補Open Redirect弱點
    // 社群媒體連結需要允許外部域名
    const allowedSocialOrigins = [
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
    
    if (typeof SecurityUtils !== 'undefined' && SecurityUtils.validateURL(url, allowedSocialOrigins)) {
        SecurityUtils.setSecureAttribute(link, 'href', url, allowedSocialOrigins);
    } else {
        // 如果URL不安全，使用安全的預設值或不設置href
        console.warn('Unsafe URL detected:', url);
        link.removeAttribute('href');
        link.setAttribute('role', 'link'); // 保持語意，但告知輔助技術它可能無法操作
        link.setAttribute('aria-disabled', 'true');
        link.style.pointerEvents = 'none'; // 視覺上禁用滑鼠點擊
        link.style.opacity = '0.5'; // 視覺上呈現禁用狀態
    }
    
    container.appendChild(label);
    container.appendChild(link);
    return container;
}

/**
 * 生成地圖連結
 * @param {Object} location - Location object with coords {lat, lng} and/or label
 * @returns {string} Google Maps URL
 */
function generateMapLink(location) {
    if (!location) return '';

    const { coords, label, mapId } = location;

    if (mapId) {
        const normalizedId = normalizeMapId(mapId);
        if (normalizedId) {
            const shareUrl = buildShareUrlFromMapId(normalizedId);
            if (shareUrl) {
                return shareUrl;
            }
        }
    }

    // 優先使用座標，否則使用標籤搜尋
    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
        const lat = sanitizeCoordinateValue(coords.lat, 'lat');
        const lng = sanitizeCoordinateValue(coords.lng, 'lng');
        if (lat !== null && lng !== null) {
            const coordsUrl = buildCoordsMapUrl(lat, lng);
            if (coordsUrl) {
                return coordsUrl;
            }
            return `${MAP_BASE_URL}?q=${lat},${lng}`;
        }
    } else if (label && label.trim()) {
        // 使用標籤搜尋: https://www.google.com/maps/search/?api=1&query=台北101
        const safeLabel = sanitizeLocationLabel(label);
        if (safeLabel) {
            const encodedLabel = encodeURIComponent(safeLabel);
            const searchUrl = `${MAP_BASE_URL}/search/?api=1&query=${encodedLabel}`;
            if (typeof SecurityUtils !== 'undefined' && typeof SecurityUtils.validateMapURL === 'function') {
                return SecurityUtils.validateMapURL(searchUrl) ? searchUrl : '';
            }
            return searchUrl;
        }
    }

    return '';
}

/**
 * 處理社群媒體連結 - 安全版本
 */
function processSocialLinks(text, lang = 'zh') {
    if (!text || !text.trim()) return document.createDocumentFragment();
    
    const buttonTexts = {
        zh: {
            facebook: '👥 造訪頁面', instagram: '❤️ 追蹤', lineOfficial: '🏢 加入官方',
            linePersonal: '👤 加好友', github: '⭐ 造訪', twitter: '👥 追蹤',
            linkedin: '🤝 連結', youtube: '🔔 訂閱', discord: '🏠 加入'
        },
        en: {
            facebook: '👥 Visit Page', instagram: '❤️ Follow', lineOfficial: '🏢 Add Official',
            linePersonal: '👤 Add Friend', github: '⭐ Visit', twitter: '👥 Follow',
            linkedin: '🤝 Connect', youtube: '🔔 Subscribe', discord: '🏠 Join'
        }
    };
    
    const texts = buttonTexts[lang] || buttonTexts.zh;
    const fragment = document.createDocumentFragment();
    
    text.split('\n').filter(line => line.trim()).forEach(line => {
        const trimmed = line.trim();
        let element = null;
        
        if (/^FB:/i.test(trimmed)) {
            const match = trimmed.match(/FB:\s*([\w\.-@\/]+)/i);
            if (match) {
                let url = match[1];
                if (url.startsWith('@')) url = `fb.com/${url.substring(1)}`;
                else if (!url.includes('.com')) url = `fb.com/${url}`;
                const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                element = createSocialElement('📘 Facebook', fullUrl, texts.facebook, '#1877f2');
            }
        } else if (/^IG:/i.test(trimmed)) {
            const match = trimmed.match(/IG:\s*([\w\.-@\/]+)/i);
            if (match) {
                let url = match[1];
                if (url.startsWith('@')) url = `instagram.com/${url.substring(1)}`;
                else if (!url.includes('.com')) url = `instagram.com/${url}`;
                const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                element = createSocialElement('📷 Instagram', fullUrl, texts.instagram, 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)');
            }
        } else if (/^LINE:/i.test(trimmed)) {
            const match = trimmed.match(/LINE:\s*([\w\.-@\/]+)/i);
            if (match) {
                const url = match[1];
                const isOfficial = url.startsWith('@');
                const fullUrl = `https://line.me/ti/p/~${url}`;
                const buttonText = isOfficial ? texts.lineOfficial : texts.linePersonal;
                element = createSocialElement('💬 LINE', fullUrl, buttonText, '#00B900', url);
            }
        } else if (/^GitHub:/i.test(trimmed)) {
            const match = trimmed.match(/GitHub:\s*([\w\.-@\/]+)/i);
            if (match) {
                let url = match[1];
                if (url.startsWith('@')) url = `github.com/${url.substring(1)}`;
                else if (!url.includes('.com')) url = `github.com/${url}`;
                const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                element = createSocialElement('🐙 GitHub', fullUrl, texts.github, '#24292e');
            }
        } else if (/^(Twitter|X):/i.test(trimmed)) {
            const match = trimmed.match(/(Twitter|X):\s*([\w\.-@\/]+)/i);
            if (match) {
                let url = match[2];
                if (url.startsWith('@')) url = `twitter.com/${url.substring(1)}`;
                else if (!url.includes('.com')) url = `twitter.com/${url}`;
                const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                element = createSocialElement('🐦 Twitter', fullUrl, texts.twitter, '#1da1f2');
            }
        } else if (/^LinkedIn:/i.test(trimmed)) {
            const match = trimmed.match(/LinkedIn:\s*([\w\.-@\/\u4e00-\u9fff-]+)/i);
            if (match) {
                let url = match[1];
                if (!url.includes('.com')) url = `linkedin.com/in/${url}`;
                const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                element = createSocialElement('💼 LinkedIn', fullUrl, texts.linkedin, '#0077b5');
            }
        } else if (/^YouTube:/i.test(trimmed)) {
            const match = trimmed.match(/YouTube:\s*([\w\.-@\/]+)/i);
            if (match) {
                let url = match[1];
                if (url.startsWith('@')) url = `youtube.com/${url}`;
                else if (!url.includes('.com')) url = `youtube.com/c/${url}`;
                const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                element = createSocialElement('📺 YouTube', fullUrl, texts.youtube, '#ff0000');
            }
        } else if (/^Discord:/i.test(trimmed)) {
            const match = trimmed.match(/Discord:\s*([\w\.-@\/]+)/i);
            if (match) {
                const url = match[1];
                const fullUrl = url.startsWith('http') ? url : `https://discord.gg/${url}`;
                element = createSocialElement('🎮 Discord', fullUrl, texts.discord, '#5865f2');
            }
        }
        
        if (element) fragment.appendChild(element);
    });
    
    return fragment;
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', initializePage);
