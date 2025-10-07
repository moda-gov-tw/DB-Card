# DECISIONS (ADR-lite)

## Decision: Use SecurityUtils for URL validation
- Date: 2025-09-09
- Status: ACCEPTED  
- Context: XSS prevention in avatar URLs and other user-controlled content
- Decision: Implement SecurityUtils.setSecureAttribute with protocol whitelist (http/https/mailto/tel)
- Consequences: Consistent security framework, blocked javascript: URIs, centralized validation logic

## Decision: Implement DOMPurify integration
- Date: 2025-09-09
- Status: ACCEPTED
- Context: HTML sanitization requirements
- Decision: Use DOMPurify with fallback to basic HTML entity encoding
- Consequences: Robust HTML sanitization, graceful degradation if library unavailable

## Decision: Centralized security logging
- Date: 2025-09-09
- Status: ACCEPTED
- Context: Security event monitoring and debugging
- Decision: Implement logSecurityEvent with sessionStorage persistence
- Consequences: Auditable security events, limited to 100 recent entries for performance

## Decision: Implement allowedOrigins whitelist for image sources
- Date: 2025-09-09
- Status: ACCEPTED
- Context: Prevent open redirect vulnerabilities in avatar URL loading
- Decision: Whitelist trusted image hosting services (imgur.com, postimg.cc, github.com, drive.google.com)
- Consequences: Reduced attack surface, blocked untrusted redirects, maintained image functionality with Google Drive support

## Decision: Fix JavaScript syntax errors in tel: links
- Date: 2025-09-08
- Status: ACCEPTED  
- Context: Missing closing parentheses in SecurityUtils.setSecureAttribute calls breaking phone link functionality
- Decision: Add missing `)` characters to complete function calls in index-personal-en.html and index1-en.html
- Consequences: Restores click-to-call functionality, eliminates console errors

## Decision: Implement WCAG accessibility improvements
- Date: 2025-09-09
- Status: ACCEPTED
- Context: Enhance accessibility compliance for screen readers and assistive technologies
- Decision: Add ARIA labels, semantic roles, and alt text across all HTML files
- Consequences: Improved screen reader support, better semantic structure, WCAG 2.1 AA compliance

## Decision: Upgrade DOMPurify to 3.2.4 for critical security patches
- Date: 2025-09-09
- Status: ACCEPTED
- Context: DOMPurify 3.0.5 has 4 critical vulnerabilities (CVE-2024-47875: Critical, CVE-2024-45801: High, CVE-2025-26791: Medium, WS-2024-0017: Medium)
- Decision: Upgrade from DOMPurify 3.0.5 to 3.2.4, maintain SecurityUtils compatibility
- Consequences: Patches nesting-based mXSS, depth checking bypass, template literal regex errors, and sanitizer bypass vulnerabilities. Maintains existing SecurityUtils integration.

## Decision: Create licenses folder for third-party compliance
- Date: 2025-09-26
- Status: ACCEPTED
- Context: Legal compliance for third-party library usage
- Decision: Create licenses/ folder with individual license files for DOMPurify, qrcode.js, and Google Fonts
- Consequences: Proper license attribution, legal compliance, clear third-party dependency documentation

## Decision: Add rel='noopener noreferrer' to target='_blank' links
- Date: 2025-10-07
- Status: ACCEPTED
- Context: Low-risk security improvement to prevent tab nabbing and cross-origin information leaks
- Decision: Add rel='noopener noreferrer' to projectLink anchor in index-bilingual-personal.html:425 and createSocialElement function in assets/bilingual-common.js:605
- Consequences: Prevents opened windows from accessing window.opener, blocks Referer header leakage, mitigates tab nabbing attacks without affecting functionality

## Decision: Fix bilingual personal vCard organization field consistency
- Date: 2025-10-07
- Status: CLOSED
- Context: Bilingual personal layout vCard generation inconsistency - empty organization still generated default "數位發展部" while monolingual personal layouts skip ORG field when empty
- Decision: Modify generateBilingualVCard() to conditionally skip ORG field when data.organization is empty, matching monolingual personal layout behavior
- Consequences: Consistent vCard generation across all personal layouts, no unwanted default organization in personal business cards