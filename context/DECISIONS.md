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