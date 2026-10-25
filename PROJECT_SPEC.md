# AccessLens — Project Specification

**Version:** 1.0.0  
**Date:** October 2026  
**Author:** Pranay  
**Status:** Prototype — AI Builder Challenge Submission

---

## 1. Overview

AccessLens is an open-source developer tool that scans a public webpage for detectable accessibility issues, explains each finding in beginner-friendly language, shows the relevant HTML element, suggests a possible fix, and allows the developer to export the report.

The prototype targets independent web developers, students, open-source maintainers, and small businesses who maintain public-facing websites without a dedicated accessibility specialist.

---

## 2. Problem Statement

Web developers frequently overlook accessibility problems that prevent people with disabilities from using websites effectively. Existing automated tools (axe DevTools, Lighthouse, WAVE) can identify many technical violations, but their output uses WCAG terminology that beginners find difficult to interpret and act on.

AccessLens bridges that gap by pairing scanner output with plain-English explanations, specific code suggestions, and downloadable reports — making the first step toward accessibility remediation achievable without specialist knowledge.

**Limitation:** Automated scanning detects only a subset of accessibility issues. Full WCAG compliance always requires manual testing with assistive technologies and expert review.

---

## 3. Architecture

```
┌──────────────────────────────────┐
│   Angular Frontend (Port 4200)   │
│   TypeScript · Angular 21        │
└──────────────┬───────────────────┘
               │ REST JSON
               ▼
┌──────────────────────────────────┐
│  Spring Boot Backend (Port 8080) │
│  Java 17+ · Maven                │
│  In-memory scan store            │
└──────────┬───────────────────────┘
           │ HTTP POST /scan
           ▼
┌──────────────────────────────────┐
│  Node.js Scanner Service (3001)  │
│  axe-core · Playwright           │
│  SSRF protection built-in        │
└──────────────────────────────────┘
```

### 3.1 Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| Angular Frontend | UI, URL input, results display, report export |
| Spring Boot Backend | Request validation, scan orchestration, in-memory storage, REST API |
| Node.js Scanner | Browser automation, axe-core execution, SSRF validation, result normalization |

### 3.2 Data Flow

1. User enters a URL in the Angular frontend.
2. Frontend sends `POST /api/scans` to Spring Boot backend.
3. Backend validates the URL format, then calls the Node.js scanner service.
4. Scanner validates the URL against SSRF rules, launches a Playwright browser, injects axe-core, and returns structured results.
5. Backend stores results in memory (keyed by scan ID), returns scan ID to frontend.
6. Frontend polls `GET /api/scans/{id}` until status is `COMPLETE` or `FAILED`.
7. User browses results; frontend fetches fix suggestions from `GET /api/fixes/{ruleId}`.
8. User downloads report via `GET /api/scans/{id}/report`.

---

## 4. Technology Choices

| Technology | Version | Reason |
|------------|---------|--------|
| Angular | 21 | Requested in spec; strong TypeScript support; reactive forms |
| Spring Boot | 3.x | Requested in spec; robust REST, built-in validation, easy to build/run |
| Node.js Scanner | 18+ | axe-core native environment; Playwright support |
| axe-core | 4.x | Industry-standard accessibility engine; open-source; WCAG-mapped rules |
| Playwright | 1.x | Reliable cross-browser automation; headless Chromium support |
| PostgreSQL | — | Documented as optional; prototype uses in-memory storage |
| Maven | 3.9 | Available in environment; Spring Boot standard build tool |

### 4.1 Why Not PostgreSQL in Prototype

Persistent storage is not required for a demonstration prototype. In-memory storage in Spring Boot is sufficient for the assessment. A PostgreSQL integration path is documented in Section 9.

---

## 5. API Endpoints

### 5.1 Spring Boot Backend (`:8080`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/scans` | Initiate a new scan |
| GET | `/api/scans/{id}` | Get scan results by ID |
| GET | `/api/scans/{id}/report` | Download HTML report |
| GET | `/api/fixes/{ruleId}` | Get fix suggestion for a rule |
| GET | `/api/demo` | Get built-in demo scan results |
| GET | `/api/health` | Health check |

### 5.2 Node.js Scanner (`:3001`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/scan` | Execute accessibility scan |
| GET | `/health` | Health check |

---

## 6. Data Models

### 6.1 ScanRequest
```json
{ "url": "https://example.com" }
```

### 6.2 ScanResult
```json
{
  "id": "uuid",
  "url": "https://example.com",
  "status": "COMPLETE",
  "timestamp": "2026-10-13T10:00:00Z",
  "violations": [...],
  "passes": [...],
  "incomplete": [...],
  "inapplicable": [...],
  "violationCount": 5,
  "passCount": 42,
  "incompleteCount": 3,
  "error": null
}
```

### 6.3 Violation
```json
{
  "id": "image-alt",
  "description": "Images must have alternate text",
  "impact": "critical",
  "help": "Ensure that img elements have alternate text or a role of none or presentation",
  "helpUrl": "https://dequeuniversity.com/rules/axe/4.9/image-alt",
  "tags": ["wcag2a", "wcag111"],
  "nodes": [
    {
      "html": "<img src=\"logo.png\">",
      "target": ["img:nth-child(1)"],
      "failureSummary": "Fix any of the following: Element does not have an alt attribute"
    }
  ],
  "nodeCount": 1
}
```

### 6.4 FixSuggestion
```json
{
  "ruleId": "image-alt",
  "title": "Add alternative text to images",
  "explanation": "Screen readers read the alt text aloud when they encounter an image...",
  "whyItMatters": "Users who are blind or have low vision rely on alt text...",
  "before": "<img src=\"logo.png\">",
  "after": "<img src=\"logo.png\" alt=\"Company logo\">",
  "wcagReference": "WCAG 2.1 Success Criterion 1.1.1 Non-text Content (Level A)",
  "verificationSteps": ["Re-scan the page with AccessLens...", "Test with a screen reader..."],
  "manualSteps": ["Identify the purpose of the image...", "Write a concise description..."]
}
```

---

## 7. SSRF Security Controls

The scanner service implements the following controls:

1. **Protocol allowlist**: Only `http://` and `https://` URLs are accepted.
2. **Private IP rejection**: Rejects `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`, `127.x.x.x`, `::1`, `fd00::/8`.
3. **Metadata endpoint rejection**: Rejects `169.254.169.254` (AWS/Azure/GCP metadata).
4. **Port allowlist**: Only ports 80 and 443 are permitted. Custom ports are rejected.
5. **DNS validation**: Hostname is resolved and checked against private ranges before scanning.
6. **Redirect validation**: Each redirect target is re-validated against SSRF rules.
7. **Timeouts**: 10-second connection timeout, 30-second page-load timeout, 60-second total scan timeout.
8. **Concurrency limit**: Maximum 3 concurrent scans.
9. **Browser isolation**: Each scan runs in a dedicated Playwright browser context.
10. **Error sanitization**: Raw stack traces and internal paths are not returned to callers.

**Limitation:** DNS rebinding attacks (where a hostname resolves differently after the initial check) are not fully prevented in this prototype. In production, re-validate the IP on every TCP connection or use a dedicated SSRF-safe HTTP client.

---

## 8. Fix Suggestion Library

The prototype includes explicit fix suggestions for the following axe-core rules:

| Rule ID | Issue | Suggestion Available |
|---------|-------|----------------------|
| `image-alt` | Missing image alt text | ✓ |
| `label` | Form input missing label | ✓ |
| `color-contrast` | Insufficient color contrast | ✓ |
| `html-has-lang` | Missing lang attribute on `<html>` | ✓ |
| `html-lang-valid` | Invalid lang attribute value | ✓ |
| `document-title` | Missing `<title>` element | ✓ |
| `link-name` | Links without accessible names | ✓ |
| `button-name` | Buttons without accessible names | ✓ |
| `aria-required-attr` | Missing required ARIA attributes | ✓ |
| `aria-valid-attr` | Invalid ARIA attribute | ✓ |
| `heading-order` | Skipped heading levels | ✓ |
| `landmark-one-main` | Missing main landmark | ✓ |

For rules not in this library, the system falls back to the axe-core help text and verification URL.

---

## 9. Database Migration Path (Future)

To add PostgreSQL persistence:

1. Add `spring-boot-starter-data-jpa` and `postgresql` dependencies to `pom.xml`.
2. Configure `spring.datasource.*` in `application.properties`.
3. Replace `ScanStore` (in-memory `ConcurrentHashMap`) with a JPA `ScanResultRepository`.
4. Run Flyway migrations to create `scans`, `violations`, and `nodes` tables.
5. Update the `ScanService` to call the repository instead of the map.

---

## 10. Report Format

The HTML report includes:

- Scan metadata (URL, timestamp, scan ID).
- Summary counts (violations, passes, incomplete).
- Full violations list with HTML snippets and suggested fixes.
- Important limitations disclaimer.
- No server credentials, environment variables, or internal paths.

---

## 11. Testing Strategy

| Test | Framework | Location |
|------|-----------|----------|
| Backend unit tests | JUnit 5 + Mockito | `backend/src/test/` |
| Backend integration tests | Spring Boot Test | `backend/src/test/` |
| Scanner unit tests | Jest | `scanner/tests/` |
| Frontend unit tests | Jasmine + Karma | `frontend/src/` |
| URL validation logic | Jest | `scanner/tests/url-validator.test.js` |

See `prototype/README.md` for exact test commands.

---

## 12. Known Limitations

1. **In-memory storage**: Scan results are lost on server restart.
2. **No authentication**: Anyone can start scans; rate limiting is basic.
3. **DNS rebinding**: Not fully protected (documented above).
4. **Playwright dependency**: Requires a real browser engine; not available in all CI environments.
5. **Automated scan coverage**: axe-core detects approximately 30–40% of WCAG success criteria automatically. Manual testing is always required for full compliance.
6. **No persistent fix library**: Fix suggestions are compiled into source; not loaded from a database.
7. **Report format**: HTML only in prototype; PDF export requires a library like wkhtmltopdf or Puppeteer PDF mode.

---

## 13. Reproduction Instructions

See `prototype/README.md` for full setup, environment configuration, and service startup instructions.

Minimum requirements:
- Node.js 18+
- Java 17+
- Maven 3.6+
- Playwright browsers installed (`npx playwright install chromium`)

---

*This specification is sufficient for another developer to understand, reproduce, and extend the prototype.*
