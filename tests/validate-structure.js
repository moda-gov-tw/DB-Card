const fs = require('fs');
const securityCode = fs.readFileSync('assets/security-utils.js', 'utf8');

// Check for key additions
const checks = [
    { name: 'ALLOWED_MAP_DOMAINS constant', pattern: /const ALLOWED_MAP_DOMAINS\s*=\s*\[/ },
    { name: 'ALLOWED_MAP_DOMAINS exported', pattern: /ALLOWED_MAP_DOMAINS:\s*ALLOWED_MAP_DOMAINS/ },
    { name: 'validateMapURL function', pattern: /validateMapURL:\s*function\(url\)/ },
    { name: 'Google Maps domains whitelist', pattern: /'https:\/\/www\.google\.com'/ },
    { name: 'maps.google.com in whitelist', pattern: /'https:\/\/maps\.google\.com'/ },
    { name: 'XSS pattern checks', pattern: /suspiciousPatterns/ },
    { name: 'HTTPS protocol check', pattern: /protocol !== 'https:'/ }
];

let passed = 0;
let failed = 0;

console.log('=== Code Structure Validation ===\n');
checks.forEach(check => {
    if (check.pattern.test(securityCode)) {
        console.log(`✅ PASS: ${check.name}`);
        passed++;
    } else {
        console.error(`❌ FAIL: ${check.name}`);
        failed++;
    }
});

console.log(`\n=== Summary ===`);
console.log(`Passed: ${passed}/${checks.length}`);
console.log(`Failed: ${failed}/${checks.length}`);

process.exit(failed > 0 ? 1 : 0);
