/**
 * TDD Test Suite for Security Utils - Map Domain Whitelist & URL Validation
 * Testing ALLOWED_MAP_DOMAINS constant and validateMapURL function
 */

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assertEqual(actual, expected, testName) {
    if (actual === expected) {
        console.log(`✅ PASS: ${testName}`);
        testsPassed++;
        return true;
    } else {
        console.error(`❌ FAIL: ${testName}`);
        console.error(`  Expected: ${expected}`);
        console.error(`  Actual: ${actual}`);
        testsFailed++;
        return false;
    }
}

function assertArrayIncludes(array, value, testName) {
    if (Array.isArray(array) && array.includes(value)) {
        console.log(`✅ PASS: ${testName}`);
        testsPassed++;
        return true;
    } else {
        console.error(`❌ FAIL: ${testName}`);
        console.error(`  Expected array to include: ${value}`);
        console.error(`  Actual array: ${JSON.stringify(array)}`);
        testsFailed++;
        return false;
    }
}

// Load SecurityUtils (ensure this runs in browser context with security-utils.js loaded)
if (typeof SecurityUtils === 'undefined') {
    console.error('❌ SecurityUtils not loaded! Please load assets/security-utils.js first.');
    process.exit(1);
}

console.log('=== Testing ALLOWED_MAP_DOMAINS Constant ===\n');

// Test 1: ALLOWED_MAP_DOMAINS is defined and is an array
assertEqual(
    Array.isArray(SecurityUtils.ALLOWED_MAP_DOMAINS),
    true,
    'ALLOWED_MAP_DOMAINS is defined as array'
);

// Test 2: Contains Google Maps domains
assertArrayIncludes(
    SecurityUtils.ALLOWED_MAP_DOMAINS,
    'https://www.google.com',
    'Contains https://www.google.com'
);

assertArrayIncludes(
    SecurityUtils.ALLOWED_MAP_DOMAINS,
    'https://maps.google.com',
    'Contains https://maps.google.com'
);

assertArrayIncludes(
    SecurityUtils.ALLOWED_MAP_DOMAINS,
    'https://maps.app.goo.gl',
    'Contains https://maps.app.goo.gl (short URLs)'
);

console.log('\n=== Testing validateMapURL Function ===\n');

// Test 3: Valid Google Maps URLs
assertEqual(
    SecurityUtils.validateMapURL('https://www.google.com/maps?q=25.033,121.565'),
    true,
    'Valid Google Maps coordinate URL'
);

assertEqual(
    SecurityUtils.validateMapURL('https://maps.google.com/?q=25.033,121.565'),
    true,
    'Valid maps.google.com coordinate URL'
);

assertEqual(
    SecurityUtils.validateMapURL('https://www.google.com/maps/search/?api=1&query=台北101'),
    true,
    'Valid Google Maps search API URL'
);

assertEqual(
    SecurityUtils.validateMapURL('https://maps.app.goo.gl/abc123'),
    true,
    'Valid Google Maps short URL'
);

// Test 4: Invalid URLs (wrong domain)
assertEqual(
    SecurityUtils.validateMapURL('https://evil.com/maps?q=25.033,121.565'),
    false,
    'Rejects non-Google Maps domain'
);

assertEqual(
    SecurityUtils.validateMapURL('https://www.bing.com/maps?q=25.033,121.565'),
    false,
    'Rejects Bing Maps domain'
);

// Test 5: Invalid protocols
assertEqual(
    SecurityUtils.validateMapURL('javascript:alert(1)'),
    false,
    'Rejects javascript: protocol'
);

assertEqual(
    SecurityUtils.validateMapURL('data:text/html,<script>alert(1)</script>'),
    false,
    'Rejects data: protocol'
);

assertEqual(
    SecurityUtils.validateMapURL('http://www.google.com/maps?q=25.033,121.565'),
    false,
    'Rejects http: protocol (requires https:)'
);

// Test 6: Empty/null/undefined
assertEqual(
    SecurityUtils.validateMapURL(''),
    false,
    'Rejects empty string'
);

assertEqual(
    SecurityUtils.validateMapURL(null),
    false,
    'Rejects null'
);

assertEqual(
    SecurityUtils.validateMapURL(undefined),
    false,
    'Rejects undefined'
);

// Test 7: Malformed URLs
assertEqual(
    SecurityUtils.validateMapURL('not a url'),
    false,
    'Rejects malformed URL'
);

assertEqual(
    SecurityUtils.validateMapURL('www.google.com/maps'),
    false,
    'Rejects URL without protocol'
);

// Test 8: XSS attempts
assertEqual(
    SecurityUtils.validateMapURL('https://www.google.com/maps?q=<script>alert(1)</script>'),
    false,
    'Rejects URL with XSS payload in query'
);

// Test 9: Open redirect attempts
assertEqual(
    SecurityUtils.validateMapURL('https://www.google.com/maps?url=https://evil.com'),
    true, // URL itself is valid Google Maps, query params are separate concern
    'Google Maps URL with redirect param is structurally valid (app logic should validate params)'
);

// Test 10: Enhanced validateURL with map domain allowlist
console.log('\n=== Testing Enhanced validateURL with Map Domains ===\n');

assertEqual(
    SecurityUtils.validateURL('https://www.google.com/maps?q=25.033,121.565', SecurityUtils.ALLOWED_MAP_DOMAINS),
    true,
    'validateURL accepts map URL with ALLOWED_MAP_DOMAINS'
);

assertEqual(
    SecurityUtils.validateURL('https://evil.com/maps', SecurityUtils.ALLOWED_MAP_DOMAINS),
    false,
    'validateURL rejects non-whitelisted map domain'
);

// Test Summary
console.log('\n=== Test Summary ===');
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed} ✅`);
console.log(`Failed: ${testsFailed} ❌`);

if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
} else {
    console.log('\n⚠️ Some tests failed!');
}
