# Changelog

All notable changes to AccessLens are documented in this file.

## [1.0.0] - 2026-10-13

### Initial Release

#### Added
- Web accessibility scanner using axe-core engine
- Angular 21 frontend with responsive design
- Spring Boot 3.x REST API backend
- Node.js scanner service with Playwright browser automation
- Real-time scan progress tracking
- Issue detail view with plain-English explanations
- 11 built-in fix suggestions for common accessibility issues
- HTML report export functionality
- Built-in demo with sample accessibility violations
- SSRF protection and security controls
- In-memory scan result storage
- CORS support for local development
- Mobile-responsive UI

#### Features
- Start accessibility scans from public URLs
- View violations grouped by severity
- Filter and search through issues
- Detailed explanations for each issue (why it matters, verification steps)
- Suggested code fixes with before/after examples
- Reference to applicable WCAG standards
- Demo mode with pre-built sample page
- Download scan results as HTML report
- Keyboard accessible interface
- Screen reader friendly

#### Technology
- Angular 21 with TypeScript
- Spring Boot 3.3 with Java 17
- Node.js 18+ with Playwright and axe-core
- PostgreSQL (optional, prototype uses in-memory storage)
- Maven for build automation

#### Known Limitations
- In-memory storage (results lost on server restart)
- Automated scan covers ~30-40% of WCAG criteria
- No authentication or user accounts
- DNS rebinding attacks not fully mitigated
- Report format: HTML only (no PDF export)

### Security
- SSRF protection with private IP range blocking
- HTTP/HTTPS only, no custom ports
- Concurrency limiting
- Browser isolation
- Error message sanitization
- Connection and navigation timeouts

## Planned for Future Releases

### Version 1.1
- PostgreSQL persistence
- User authentication and accounts
- Scan history and comparison
- Custom fix suggestions
- PDF report export

### Version 2.0
- Continuous scanning integration
- CI/CD pipeline integration (GitHub Actions, GitLab CI)
- Team collaboration features
- Fix verification automation
- Advanced reporting

---

For more information, see [README.md](README.md) and [PROJECT_SPEC.md](PROJECT_SPEC.md).
