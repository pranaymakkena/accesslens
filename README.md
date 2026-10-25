# AccessLens

🔍 **Make the web usable for everyone.**

AccessLens is an open-source web accessibility scanner that detects accessibility issues, explains them in beginner-friendly language, suggests code fixes, and generates downloadable reports.

**Latest Version:** 1.0.0 (2026-10-13)  
**License:** MIT  
**Status:** Active Prototype — Fully Functional

---

## Problem Addressed

Web developers frequently overlook accessibility problems that prevent people with disabilities from using websites effectively. Existing accessibility tools (axe DevTools, Lighthouse, WAVE) identify violations using technical WCAG terminology that beginners find difficult to interpret and act on.

AccessLens bridges that gap by combining automated accessibility scanning with plain-English explanations and beginner-friendly code suggestions.

**Important:** Automated scanning detects only ~30–40% of accessibility issues. Full WCAG compliance always requires manual testing with assistive technologies and expert review.

---

## Intended Users

- **Primary:** Independent web developers and small development teams maintaining public websites without dedicated accessibility specialists.
- **Secondary:** Students, open-source maintainers, freelancers, and small businesses.

---

## Features

### Core Scanning
- ✓ Scan any public URL for accessibility issues
- ✓ Detects ~30 accessibility rules using axe-core engine
- ✓ Real-time scan progress tracking
- ✓ SSRF protection and security controls

### Results & Reporting
- ✓ Issues grouped by severity (critical, serious, moderate, minor)
- ✓ Search and filter functionality
- ✓ Plain-English issue explanations
- ✓ HTML report export with scan metadata
- ✓ Includes passes and incomplete checks

### Fix Suggestions
- ✓ 11 built-in code fix suggestions for common issues
- ✓ Before/after code examples
- ✓ Verification steps and manual remediation guidance
- ✓ WCAG standard references

### Demo & Learning
- ✓ Built-in demo mode with sample accessibility issues
- ✓ Before/after comparison view
- ✓ Sample HTML showing common mistakes
- ✓ No external scanning required for demo

### Accessibility
- ✓ Fully keyboard navigable
- ✓ Screen reader friendly
- ✓ High contrast support
- ✓ Mobile-responsive design
- ✓ ARIA landmarks and labels

---

## Technology Stack

| Component | Technology | Version | Why |
|-----------|-----------|---------|-----|
| Frontend | Angular | 21 | Type-safe, component-based, reactive forms |
| Backend | Spring Boot | 3.3 | Robust REST API, built-in validation, easy deployment |
| Scanner | Node.js + Playwright | 18+ | Browser automation, axe-core native support |
| Accessibility Engine | axe-core | 4.8 | Industry standard, WCAG-mapped rules, open-source |
| Persistence | In-memory (PostgreSQL optional) | — | Prototype uses in-memory; PostgreSQL integration ready |
| Build | Maven + npm | — | Standard Java and Node tooling |

---

## Architecture

```
┌─────────────────────────────────┐
│   Browser (Angular Frontend)    │ Port 4200
│   - URL input & launch UI       │
│   - Results dashboard           │ POST /api/scans
│   - Issue details & fixes       │ GET  /api/scans/{id}
│   - Report export               │ GET  /api/fixes/{ruleId}
└────────────┬────────────────────┘
             │ REST JSON
             ▼
┌─────────────────────────────────┐
│  Spring Boot Backend            │ Port 8080
│  - Request validation           │
│  - Scan orchestration           │ HTTP POST
│  - Result storage (in-memory)   │ /scan
│  - Report generation            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Node.js Scanner Service        │ Port 3001
│  - URL validation & SSRF check  │
│  - Browser automation           │
│  - axe-core execution           │
│  - Result normalization         │
└─────────────────────────────────┘
```

---

## Installation & Setup

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **Java** 17+ (JDK)
- **Maven** 3.6+
- **npm** 7+

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/pranaymakkena/accesslens.git
cd accesslens/prototype
```

#### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

#### 3. Install Scanner Dependencies

```bash
cd scanner
npm install
npx playwright install chromium
cd ..
```

#### 4. Build Backend

```bash
cd backend
mvn clean install
cd ..
```

#### 5. Create Configuration Files (Optional)

For custom settings, create `.env` files:

**`scanner/.env`:**
```env
PORT=3001
NODE_ENV=development
```

**`backend/application.properties`** is already configured.

---

## Running the Application

### Start All Services

**Terminal 1 — Scanner Service (http://localhost:3001):**
```bash
cd prototype/scanner
npm start
```

Expected output:
```
✓ AccessLens Scanner running on http://localhost:3001
```

**Terminal 2 — Backend API (http://localhost:8080):**
```bash
cd prototype/backend
mvn spring-boot:run
```

Expected output:
```
Started AccessLensApplication in X seconds
```

**Terminal 3 — Frontend (http://localhost:4200):**
```bash
cd prototype/frontend
ng serve --open
```

This opens the app automatically in your browser.

### Verify Setup

Test that all services are running:
```bash
curl http://localhost:3001/health
curl http://localhost:8080/api/health
# Navigate to http://localhost:4200 in your browser
```

---

## Using the Application

### Scanning a Website

1. **Navigate to the home page** (http://localhost:4200).
2. **Enter a public URL** (e.g., `https://example.com`).
3. **Click "Scan Website"** — the scan will begin.
4. **Wait for results** (up to 30 seconds).

### Viewing Results

- **Summary:** Number of violations, passes, incomplete checks.
- **Grouped by severity:** Critical, Serious, Moderate, Minor.
- **Filter & search:** Use the filter chips and search box.

### Viewing Issue Details

1. **Click "View Details & Fix"** on any issue card.
2. **Plain-English explanation:** Why the issue matters.
3. **Affected elements:** HTML snippets showing the problem.
4. **Suggested fix:** Before/after code examples.
5. **Verification steps:** How to test the fix.

### Downloading Reports

1. **Click "⬇️ Download Report"** at the top of results.
2. An HTML file will be downloaded with scan metadata and findings.

### Using the Demo

1. **Click "📋 View Sample Scan Results"** on the home page.
2. Explore pre-built violations and fix suggestions.
3. Compare "Before" and "After" states.

---

## Running Tests

### Frontend Unit Tests

```bash
cd frontend
ng test
```

### Backend Tests

```bash
cd backend
mvn test
```

### Scanner URL Validation Tests

```bash
cd scanner
npm test
```

---

## Deployment Notes

### Development

The current setup is suitable for local development and demonstrations. Three services must run simultaneously.

### Production Considerations

1. **Use HTTPS** for all endpoints.
2. **Add authentication** to the `/api/scans` endpoint.
3. **Implement rate limiting** per IP or API key.
4. **Run the scanner in a container** (Docker) for isolation.
5. **Add PostgreSQL** for persistent scan history.
6. **Use a reverse proxy** (nginx) with caching and WAF.
7. **Monitor logs** and set up alerts.

### Example Docker Setup (Future)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npx playwright install chromium
CMD ["npm", "start"]
```

---

## Known Limitations

1. **In-Memory Storage:** Scan results are lost when the backend restarts. This is acceptable for a prototype; PostgreSQL integration path is documented in PROJECT_SPEC.md.

2. **Automated Scan Coverage:** axe-core detects approximately 30–40% of WCAG 2.1 success criteria. Manual testing is always necessary for full compliance.

3. **No Persistent Authentication:** The API has no user authentication. Anyone can initiate scans. Rate limiting should be added for production.

4. **DNS Rebinding Protection:** Limited. In production, use DNS-over-HTTPS or re-validate IPs on each connection.

5. **Report Format:** HTML only. PDF export requires additional libraries (wkhtmltopdf or Puppeteer PDF).

6. **Single Browser Engine:** Uses Chromium only. Firefox and Safari scanning would require additional implementation.

---

## Security Considerations

### SSRF Protection

The scanner protects against Server-Side Request Forgery attacks:

- ✓ Blocks private IP ranges (10.x.x.x, 172.16–31.x.x, 192.168.x.x, 127.x.x.x).
- ✓ Blocks cloud metadata endpoints (169.254.169.254).
- ✓ Allows only HTTP and HTTPS protocols.
- ✓ Allows only standard ports (80, 443).
- ✓ Validates DNS resolution.
- ✓ Redirects are re-validated.

**Limitation:** DNS rebinding attacks (where a hostname resolves to different IPs) are not fully mitigated. For production, use a dedicated SSRF-safe HTTP client or DNS-over-HTTPS.

### Other Security Measures

- ✓ Scan timeouts (30 seconds max).
- ✓ Concurrency limits (max 3 concurrent scans).
- ✓ Error message sanitization (no internal paths or stack traces).
- ✓ Browser isolation (each scan in dedicated browser context).

For more details, see [SECURITY.md](SECURITY.md).

---

## Troubleshooting

### Frontend won't connect to backend

**Error:** "Cannot connect to the AccessLens backend. Please ensure the server is running on port 8080."

**Fix:**
```bash
# Ensure backend is running on port 8080
cd backend
mvn spring-boot:run

# Check port is open
curl http://localhost:8080/api/health
```

### Scanner service not available

**Error:** "Scan failed: Request timeout" or similar.

**Fix:**
```bash
# Ensure scanner is running on port 3001
cd scanner
npm start

# Verify
curl http://localhost:3001/health
```

### Browser automation fails

**Error:** "Failed to launch browser" or "No usable sandbox found".

**Fix:**
```bash
# Re-install Playwright browsers
cd scanner
npm install
npx playwright install chromium

# On Linux, install system dependencies
sudo apt-get install libglib2.0-0 libx11-6 libnss3
```

### Port already in use

**Error:** "Error: listen EADDRINUSE: address already in use :::4200"

**Fix:**
```bash
# Kill process on port 4200
# On macOS/Linux:
lsof -ti:4200 | xargs kill -9

# On Windows:
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### How to Contribute

1. Report bugs and feature requests.
2. Submit pull requests with improvements.
3. Improve documentation.
4. Add more fix suggestions for additional accessibility rules.
5. Test on real assistive technologies.

---

## Security Reporting

If you discover a security vulnerability, please see [SECURITY.md](SECURITY.md) for responsible disclosure.

**Do not** open a public GitHub issue. Email security@accesslens-project.com with details.

---

## Roadmap

### Version 1.1 (Planned)
- PostgreSQL persistence
- User authentication
- Scan history and comparison
- Custom fix templates

### Version 2.0 (Planned)
- CI/CD integration (GitHub Actions, GitLab CI)
- Team collaboration
- Advanced reporting

---

## Disclaimer

**This is a prototype for demonstration and assessment purposes.** It is not recommended for production use without additional hardening, authentication, and monitoring.

Automated accessibility scanning detects only a subset of issues. Always conduct manual testing with assistive technologies and involve users with disabilities.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## References

- **W3C WAI:** https://www.w3.org/WAI/
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **axe-core:** https://github.com/dequelabs/axe-core
- **Playwright:** https://playwright.dev/
- **Angular:** https://angular.io/
- **Spring Boot:** https://spring.io/projects/spring-boot

---

## Support

- **Issues:** GitHub Issues: https://github.com/pranaymakkena/accesslens/issues
- **Documentation:** See PROJECT_SPEC.md for technical details.
- **Email:** support@accesslens-project.com (placeholder)

---

**Built with ❤️ for accessibility.**
