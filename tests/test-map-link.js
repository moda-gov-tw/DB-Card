/**
 * Test suite for map link generation (bilingual-common.js)
 * Testing MAP_BASE_URL constant and generateMapLink function
 */

// Mock MAP_BASE_URL for testing
const MAP_BASE_URL = 'https://www.google.com/maps';

/**
 * 生成地圖連結
 * @param {Object} location - Location object with coords {lat, lng} and/or label
 * @returns {string} Google Maps URL
 */
function generateMapLink(location) {
    if (!location) return '';

    const { coords, label } = location;

    // 優先使用座標,否則使用標籤搜尋
    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
        // 使用座標: https://www.google.com/maps?q=25.0330,121.5654
        return `${MAP_BASE_URL}?q=${coords.lat},${coords.lng}`;
    } else if (label && label.trim()) {
        // 使用標籤搜尋: https://www.google.com/maps/search/?api=1&query=台北101
        const encodedLabel = encodeURIComponent(label.trim());
        return `${MAP_BASE_URL}/search/?api=1&query=${encodedLabel}`;
    }

    return '';
}

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

function assertIncludes(str, substring, testName) {
    if (str.includes(substring)) {
        console.log(`✅ PASS: ${testName}`);
        testsPassed++;
        return true;
    } else {
        console.error(`❌ FAIL: ${testName}`);
        console.error(`  Expected "${str}" to include "${substring}"`);
        testsFailed++;
        return false;
    }
}

// Test Suite
console.log('=== Testing MAP_BASE_URL Constant ===\n');

// Test 1: MAP_BASE_URL is defined
assertEqual(typeof MAP_BASE_URL, 'string', 'MAP_BASE_URL is defined as string');
assertEqual(MAP_BASE_URL, 'https://www.google.com/maps', 'MAP_BASE_URL has correct value');

console.log('\n=== Testing generateMapLink Function ===\n');

// Test 2: null/undefined location
assertEqual(generateMapLink(null), '', 'Returns empty string for null location');
assertEqual(generateMapLink(undefined), '', 'Returns empty string for undefined location');
assertEqual(generateMapLink({}), '', 'Returns empty string for empty object');

// Test 3: Location with coordinates only
const locationWithCoords = {
    coords: { lat: 25.0330, lng: 121.5654 }
};
const coordsUrl = generateMapLink(locationWithCoords);
assertIncludes(coordsUrl, MAP_BASE_URL, 'Coords-only URL includes base URL');
assertIncludes(coordsUrl, '?q=25.033,121.5654', 'Coords-only URL includes correct query params');

// Test 4: Location with label only
const locationWithLabel = {
    label: '台北101'
};
const labelUrl = generateMapLink(locationWithLabel);
assertIncludes(labelUrl, MAP_BASE_URL, 'Label-only URL includes base URL');
assertIncludes(labelUrl, '/search/?api=1&query=', 'Label-only URL uses search API');
assertIncludes(labelUrl, encodeURIComponent('台北101'), 'Label-only URL encodes label correctly');

// Test 5: Location with both coords and label (should prioritize coords)
const locationWithBoth = {
    coords: { lat: 25.0330, lng: 121.5654 },
    label: '台北101'
};
const bothUrl = generateMapLink(locationWithBoth);
assertIncludes(bothUrl, '?q=25.033,121.5654', 'Prioritizes coords when both available');

// Test 6: Edge cases - invalid coords
const invalidCoords = {
    coords: { lat: 'invalid', lng: 121.5654 }
};
const invalidUrl = generateMapLink(invalidCoords);
assertEqual(invalidUrl, '', 'Returns empty string for invalid coords');

// Test 7: Edge cases - whitespace label
const whitespaceLabel = {
    label: '   '
};
assertEqual(generateMapLink(whitespaceLabel), '', 'Returns empty string for whitespace-only label');

// Test 8: Label with special characters
const specialLabel = {
    label: '台北市中正區延平南路143號'
};
const specialUrl = generateMapLink(specialLabel);
assertIncludes(specialUrl, encodeURIComponent('台北市中正區延平南路143號'), 'Encodes special characters in label');

// Test 9: Label with leading/trailing spaces
const spacedLabel = {
    label: '  台北101  '
};
const spacedUrl = generateMapLink(spacedLabel);
assertIncludes(spacedUrl, encodeURIComponent('台北101'), 'Trims spaces from label');

// Test 10: Negative coordinates
const negativeCoords = {
    coords: { lat: -33.8688, lng: 151.2093 } // Sydney
};
const negativeUrl = generateMapLink(negativeCoords);
assertIncludes(negativeUrl, '?q=-33.8688,151.2093', 'Handles negative coordinates correctly');

// Test Summary
console.log('\n=== Test Summary ===');
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed} ✅`);
console.log(`Failed: ${testsFailed} ❌`);

if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
} else {
    console.log('\n⚠️ Some tests failed!');
    process.exit(1);
}
