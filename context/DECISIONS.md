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

## Decision: Fix bilingual personal vCard address field consistency
- Date: 2025-10-07
- Status: CLOSED
- Context: Bilingual personal layout vCard generation inconsistency - empty address still generated default moda address while personal layouts should skip ADR field when empty
- Decision: Modify generateBilingualVCard() to conditionally skip ADR field when data.address is empty, matching ORG field logic for personal layout consistency
- Consequences: Consistent vCard generation across all personal layouts, no unwanted default address in personal business cards

## Decision: Fix bilingual personal layout page title and organization display
- Date: 2025-10-07
- Status: CLOSED
- Context: Personal layout pages incorrectly displayed institutional information - page title showed "Ministry of Digital Affairs" and organization info was updated with institutional defaults
- Decision: Modify updatePageTitle() to show personal name for personal layouts and skip updateOrganizationInfo() in renderBilingualCard() when data.organization exists
- Consequences: Personal layouts now display personalized titles and skip institutional organization updates, maintaining clear separation between personal and institutional card types

## Decision: Fix avatar validation and production logging security issues
- Date: 2025-10-14
- Status: CLOSED
- Context: Empty avatar URLs causing security-utils validation failures, production debug logs exposing URLs/whitelists, direct avatar src setting bypassing origin validation
- Decision: Implement localhost-only debug logging, centralized updateAvatar helper with ALLOWED_AVATAR_ORIGINS whitelist, route all avatar updates through SecurityUtils validation
- Consequences: Eliminates production information disclosure, prevents DOM injection via unsafe avatar URLs, consolidates avatar handling logic with graceful error handling

## Decision: Fix QR capacity overflow and avatar empty value handling
- Date: 2025-10-14
- Status: CLOSED
- Context: QR code generation failing with capacity overflow (1692>1056), avatar elements showing when no data provided, user experience regression from complex optimizations
- Decision: Simple technical fixes - change QR error correction level H→L for 2-3x capacity increase, add empty value checks for avatar display in single language versions
- Consequences: Resolves QR generation failures with minimal code changes, properly hides empty avatars, maintains full functionality while prioritizing user experience over complex optimizations