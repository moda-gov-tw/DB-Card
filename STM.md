# Short-Term Memory (STM) - DB-Card Project

## Latest Changes (2025-10-23)

### Task 3.1: Security Configuration Extension - Map Domain Whitelist & URL Validation ✅

**File Modified:** `assets/security-utils.js`

#### Changes Implemented:

1. **Map Domain Whitelist Constant** (Lines 12-20)
   - Added `ALLOWED_MAP_DOMAINS` constant array
   - Contains trusted Google Maps domains:
     - `https://www.google.com`
     - `https://maps.google.com`
     - `https://maps.app.goo.gl`
   - Publicly exported via `SecurityUtils.ALLOWED_MAP_DOMAINS` (Line 25)
   - Used for validating map URLs against Open Redirect attacks

2. **New `validateMapURL()` Function** (Lines 187-246)
   - **Purpose:** Specialized validation for map service URLs
   - **Security Checks:**
     - Empty/null/undefined value rejection
     - HTTPS protocol enforcement (no HTTP allowed)
     - Origin whitelist validation against `ALLOWED_MAP_DOMAINS`
     - XSS payload detection (blocks `<script>`, `javascript:`, `on*=`, `<iframe>`)
   - **Returns:** `boolean` - true if safe, false otherwise
   - **Logging:** All validation failures logged to `logSecurityEvent()`

3. **Enhanced `validateURL()` Function** (Lines 124-180)
   - Existing function now works seamlessly with map domains
   - When called with `SecurityUtils.ALLOWED_MAP_DOMAINS` as `allowedOrigins`
   - Validates map URLs using the same origin-checking mechanism
   - Example: `validateURL(mapUrl, SecurityUtils.ALLOWED_MAP_DOMAINS)`

#### Data Structure:

**ALLOWED_MAP_DOMAINS Constant:**
```javascript
const ALLOWED_MAP_DOMAINS = [
    'https://www.google.com',      // Main Google Maps
    'https://maps.google.com',     // Legacy Maps subdomain
    'https://maps.app.goo.gl'      // Short URL service
];
```

**Usage Example:**
```javascript
// Method 1: Use dedicated validateMapURL function
if (SecurityUtils.validateMapURL(mapUrl)) {
    // Safe to use
    element.href = mapUrl;
}

// Method 2: Use validateURL with map domains whitelist
if (SecurityUtils.validateURL(mapUrl, SecurityUtils.ALLOWED_MAP_DOMAINS)) {
    // Safe to use
    SecurityUtils.setSecureAttribute(element, 'href', mapUrl, SecurityUtils.ALLOWED_MAP_DOMAINS);
}
```

#### Security Features:

- ✅ **Open Redirect Protection:** Only whitelisted Google Maps domains allowed
- ✅ **HTTPS Enforcement:** Rejects HTTP URLs (even for Google domains)
- ✅ **XSS Prevention:** Detects and blocks script injection attempts
- ✅ **Malformed URL Rejection:** URL parsing errors are caught and logged
- ✅ **Comprehensive Logging:** All validation events logged for security audit
- ✅ **Zero Trust:** Empty/null values rejected by default

#### Test Coverage:

Created comprehensive test suite: `tests/test-security-map-validation.html` and `tests/test-security-map-validation.js`

**Test Cases:**
1. ✅ ALLOWED_MAP_DOMAINS constant is array
2. ✅ Contains all required Google Maps domains
3. ✅ Validates legitimate Google Maps URLs
4. ✅ Rejects non-Google domains (evil.com, bing.com)
5. ✅ Blocks dangerous protocols (javascript:, data:, http:)
6. ✅ Handles empty/null/undefined values safely
7. ✅ Rejects malformed URLs
8. ✅ Detects XSS payloads in URLs
9. ✅ Integration with existing validateURL function
10. ✅ Cross-origin validation with whitelist

#### Integration Notes:

- Compatible with `bilingual-common.js` map link generation
- Works with existing `SecurityUtils.setSecureAttribute()` flow
- No breaking changes to existing security functions
- Backward compatible with all display pages

#### Key Benefits:

1. **Defense in Depth:** Multiple layers of validation (protocol, origin, content)
2. **Centralized Security:** Single source of truth for allowed map domains
3. **Auditability:** All validation events logged to sessionStorage
4. **Developer-Friendly:** Simple API (`validateMapURL(url)` returns boolean)
5. **Future-Proof:** Easy to extend whitelist for additional map services

#### Usage in Production:

**Personal Display Pages** (`index-personal.html`, `index-personal-en.html`):
```javascript
// Location object rendering (Lines 659-696)
if (data.location && typeof data.location.lat === 'number') {
    const mapUrl = `https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`;

    if (SecurityUtils.validateMapURL(mapUrl)) {
        SecurityUtils.setSecureAttribute(
            locationLink,
            'href',
            mapUrl,
            SecurityUtils.ALLOWED_MAP_DOMAINS
        );
    }
}
```

#### Security Compliance:

- ✅ **OWASP ASVS:** Meets V5.1.5 (URL Redirect Whitelist)
- ✅ **CWE-601:** Mitigates Open Redirect vulnerability
- ✅ **CWE-79:** Prevents reflected XSS via URL parameters
- ✅ **Secure by Default:** Fails closed (rejects on any validation error)

---

## Latest Changes (2025-10-23)

### Task 2.2: Personal Display Pages Location Support ✅

**Files Modified:** `index-personal.html`, `index-personal-en.html`

#### Changes Implemented:

1. **Location Object Parsing** (Lines 864-871 in both files)
   - Enhanced `convertCompactToFull()` function
   - Added parsing for `compactData.loc` object
   - Extracts `lat` and `lng` fields into `data.location`
   - Validates object structure and field existence

2. **Display Logic Enhancement** (Lines 659-696)
   - **Priority 1:** Location object (if present)
     - Creates clickable Google Maps link
     - Format: `https://maps.google.com/?q={lat},{lng}`
     - Display text: `📍 {lat}, {lng}`
     - Uses `SecurityUtils.setSecureAttribute()` for safe URL handling
   - **Priority 2:** Text address (fallback)
     - Maintains existing multi-line address support
     - Splits by newline and renders with `<br>` tags
   - **Priority 3:** Hide (if neither present)

3. **VCard Integration** (Lines 746-753)
   - Added location-aware address field generation
   - Location mode: Uses `GEO:{lat};{lng}` (VCard 3.0 standard)
   - Text mode: Uses `ADR;TYPE=work;CHARSET=UTF-8:;;{address};;;;Taiwan`
   - Mutual exclusivity ensured

#### Data Structure:

**Compact Format (from generator):**
```javascript
{
  n: "王小明",
  t: "專案經理",
  d: "資訊部",
  loc: {           // NEW: Location object
    lat: 25.033964,
    lng: 121.564468
  }
  // addr is empty when location is used
}
```

**Full Format (after parsing):**
```javascript
{
  data: {
    name: "王小明",
    title: "專案經理",
    department: "資訊部",
    location: {    // NEW: Parsed location
      lat: 25.033964,
      lng: 121.564468
    },
    address: "",   // Empty when location is used
    // ... other fields
  }
}
```

#### Key Features:

- ✅ Google Maps integration (clickable coordinates)
- ✅ VCard GEO field support (standard compliant)
- ✅ Security: Uses `SecurityUtils.setSecureAttribute()` for all URLs
- ✅ Graceful fallback to text address
- ✅ Bilingual support (works with both ZH and EN versions)
- ✅ DOM manipulation security (no innerHTML for user data)

#### Test Coverage:

Created test suite: `tests/test-personal-location.html`

**Test Cases:**
1. ✅ Location Object Parsing - Validates `convertCompactToFull()` correctly extracts location
2. ✅ Google Maps Link Generation - Validates URL and display format
3. ✅ Address Fallback - Validates text address when no location
4. ✅ VCard GEO Field - Validates VCard 3.0 GEO format

#### Integration Notes:

- Compatible with `nfc-generator-bilingual.html` location output
- Works with compact format field `loc` (not `location`)
- Seamlessly integrates with existing address display logic
- No breaking changes to existing functionality

#### VCard Standard Reference:

- VCard 3.0 GEO field format: `GEO:{latitude};{longitude}`
- Semicolon separator (not comma)
- Compatible with iOS Contacts and Google Contacts

---

## Latest Changes (2025-10-23)

### Task 1.2: Bilingual Generator Coordinate Input Support ✅

**File Modified:** `nfc-generator-bilingual.html`

#### Changes Implemented:

1. **UI Enhancements** (Lines 343-385)
   - Added radio button toggle for address input type selection
   - Two modes: "文字地址 / Text Address" and "GPS 座標 / GPS Coordinates"
   - Added bilingual coordinate input fields (latitude/longitude)
   - Maintained existing bilingual text address fields
   - Added comprehensive help text in both Chinese and English

2. **Toggle Logic** (Lines 904-919)
   - New function: `toggleAddressType()`
   - Dynamically shows/hides text address or coordinate input groups
   - Seamless switching between input modes

3. **Event Listeners** (Lines 872-876)
   - Added event listeners for address type radio buttons
   - Integrated with existing capacity monitoring system
   - Added latitude and longitude to monitored inputs (Line 856)

4. **Data Collection Logic** (Lines 695-750)
   - Enhanced `collectFormData()` function
   - Checks selected address type (text vs. coords)
   - For GPS mode:
     - Creates Location object: `{ lat: number, lng: number }`
     - Validates and parses float values
     - Only creates location object if both lat and lng are provided
   - For text mode:
     - Maintains bilingual format: `addressZh~addressEn`
   - Ensures mutual exclusivity: either `address` or `location`, not both

#### Test Coverage:

Created comprehensive test suite: `tests/test-bilingual-coords.html`

**Test Cases:**
1. ✅ Text Address Mode (Bilingual) - Validates bilingual separator (~)
2. ✅ GPS Coordinates Mode - Validates Location object structure
3. ✅ Location Object Structure - Validates data types and coordinate ranges
4. ✅ Toggle Between Modes - Validates seamless switching

#### Data Structure:

**Text Address Mode:**
```javascript
{
  name: "王小明~Wang Xiaoming",
  title: "經理~Manager",
  address: "台北市信義區~Taipei City Xinyi District",
  // ... other fields
}
```

**GPS Coordinates Mode:**
```javascript
{
  name: "王小明~Wang Xiaoming",
  title: "經理~Manager",
  location: {
    lat: 25.033964,
    lng: 121.564468
  },
  address: "",  // Empty when using coordinates
  // ... other fields
}
```

#### Key Features:

- ✅ Bilingual UI (Chinese / English)
- ✅ Toggle between text address and GPS coordinates
- ✅ Real-time capacity monitoring for both modes
- ✅ Automatic Google Maps link generation from coordinates (frontend rendering)
- ✅ Privacy-friendly: coordinates more compact than text addresses
- ✅ Backward compatible with existing text address functionality

#### Integration Notes:

- Works with existing `encodeCompact()` function from `bilingual-common.js`
- Compatible with all three layout types:
  - `official-yanping` (延平大樓)
  - `official-xinyi` (新光大樓)
  - `personal` (個人版 - only mode supporting custom addresses/coordinates)
- Seamlessly integrates with existing bilingual data flow

#### Next Steps / Recommendations:

1. ✅ Frontend pages (`index-bilingual-personal.html`) should handle Location object rendering
2. ✅ Implement Google Maps link generation: `https://maps.google.com/?q={lat},{lng}`
3. ✅ Consider adding GPS coordinate validation (range checks)
4. ✅ Test with real NFC card capacity (492 bytes limit)

---

## Previous Context

### Project Overview
- Digital business card generator for NFC cards
- Supports bilingual (Chinese/English) content
- Multiple layout types (official vs. personal)
- Capacity-optimized for NFC cards (492 bytes limit)

### Recent Features
- Bilingual support with `~` separator
- Dynamic layout switching
- Real-time capacity monitoring
- Social media link processing
- QR code generation
- Avatar URL support (including Google Drive conversion)

---

*Last Updated: 2025-10-23*
*Updated By: Claude Code Agent*
