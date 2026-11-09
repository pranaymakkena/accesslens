# AccessLens

🔍 **Make the web usable for everyone.**

AccessLens is a free, open-source web accessibility toolkit. It scans any public URL for WCAG violations, scores your site 0–100, explains every issue in plain English, suggests specific code fixes, and gives you a full remediation roadmap — no accessibility expertise required.

**Version:** 1.2.0 (2026-11-09)  
**License:** MIT  
**Status:** Active Prototype — Fully Functional

---

## What Makes AccessLens Different

Most accessibility checkers hand you a list of violations and a link to documentation. AccessLens goes further:

| Capability | axe DevTools | WAVE | Lighthouse | **AccessLens** |
|---|---|---|---|---|
| Accessibility score (0–100) | ❌ | ❌ | ✅ | ✅ |
| WCAG principle breakdown | ❌ | ❌ | ❌ | ✅ |
| **Neo4j DOM dependency graph** | ❌ | ❌ | ❌ | ✅ |
| **Cascading impact analysis** | ❌ | ❌ | ❌ | ✅ |
| **aria-hidden cascade detection** | ❌ | ❌ | ❌ | ✅ |
| **WCAG spec graph linking** | ❌ | ❌ | ❌ | ✅ |
| **Shadow DOM mapping** | ❌ | ❌ | ❌ | ✅ |
| Smart Fix Roadmap (ROI ranking) | ❌ | ❌ | ❌ | ✅ |
| Scan history + trend sparklines | ❌ | ❌ | ❌ | ✅ |
| Color contrast checker built-in | ❌ | ❌ | ❌ | ✅ |
| One-click fix code copy | ❌ | ❌ | ❌ | ✅ |
| Plain-English fix explanations | Partial | ❌ | ❌ | ✅ |
| CSV + JSON export | ❌ | ❌ | JSON only | ✅ |
| 25+ fix templates | ❌ | ❌ | ❌ | ✅ |
| Free & open-source | Paid | Free | Free | ✅ |

---

## Problem Addressed

Web developers frequently overlook accessibility problems that prevent people with disabilities from using websites effectively. Existing tools identify violations using technical WCAG terminology that beginners find difficult to interpret and act on.

AccessLens bridges that gap by combining automated scanning with plain-English explanations, concrete fix suggestions, and a prioritised roadmap so developers know exactly what to fix first.

> **Important:** Automated scanning detects only ~30–40% of WCAG 2.1 success criteria. Full compliance always requires manual testing with assistive technologies and expert review.

---

## Features

### 🏆 Accessibility Score (0–100)
- Weighted score based on violation severity × number of affected elements
  - Critical: 25 pts penalty per affected element
  - Serious: 10 pts, Moderate: 5 pts, Minor: 2 pts
- Letter grade: **A** (90+) · **B** (75+) · **C** (60+) · **D** (40+) · **F** (<40)
- Colour-coded breakdown bars per severity level

### 📊 WCAG 2.1 Principle Coverage
- 👁️ **Perceivable** — images, contrast, captions
- ⌨️ **Operable** — keyboard, focus, links, timing
- 🧠 **Understandable** — language, labels, headings
- 🔧 **Robust** — ARIA correctness, duplicate IDs, parsing

### �️ Neo4j Accessibility Dependency Graph (`/graph/:id`)

The centrepiece feature. After every scan, AccessLens persists the entire DOM
element hierarchy and all violations into **Neo4j** as a property graph, then
runs Cypher graph algorithms to produce insights no flat-list tool can generate.

**Graph data model:**
```cypher
// DOM hierarchy preserved as a directed tree
CREATE (p:DomElement {tag: "form", selector: "main > form", scanId: $id})
CREATE (c:DomElement {tag: "input", selector: "main > form > input", scanId: $id})
CREATE (p)-[:CONTAINS]->(c)

// Violation node linked to the element that fails
CREATE (v:GraphViolation {ruleId: "label", severity: "critical", scanId: $id})
CREATE (c)-[:HAS_VIOLATION]->(v)

// Live violation linked to the pre-seeded W3C specification graph
MATCH (sc:WcagCriteria {criteriaId: "3.3.2"})
CREATE (v)-[:VIOLATES]->(sc)
```

**Cascading Impact Analysis** — the headline feature:
- A Cypher `CONTAINS*1..` traversal walks every ancestor in the DOM tree
- Identifies **Root Cause Components**: ancestor nodes whose subtrees contain the most distinct violation types
- _"Fix this one `<header>` component and you resolve 80% of your site's violations"_
- Stops developers treating 50 identical `image-alt` violations as 50 separate tasks

**aria-hidden Cascade Detection:**
- Finds every element with `aria-hidden="true"` and maps all its descendants
- Shows which focusable children are silently invisible to screen readers
- A gap axe-core reports as a flat violation but cannot explain structurally

**WCAG Specification Graph Linking:**
- The complete WCAG 2.1 spec (20 criteria, 4 principles) is pre-seeded as a static sub-graph in Neo4j on startup
- Live violation nodes are dynamically linked to `(:WcagCriteria)` nodes via `[:VIOLATES]`
- A single Cypher query returns a fully spec-linked compliance roadmap sorted by severity

**Visual DOM Map (Cytoscape.js):**
- Interactive force-directed graph rendered in the browser
- Nodes colour-coded by highest violation severity (critical=red, serious=orange, moderate=amber, minor=green, clean=grey)
- `aria-hidden` subtrees: dashed hexagon border  |  Shadow DOM elements: diamond shape
- Click any node for a detail panel showing selector, violations, and accessibility attributes
- Zoom, fit, and layout controls

**Shadow DOM Support:**
- Selectors containing `>>` are identified as Shadow DOM crossings
- Shadow root elements rendered as distinct diamond nodes in the graph
- Connects what other tools see as disconnected sub-trees

### �🗺️ Smart Fix Roadmap
- Top-5 violations ranked by **impact ÷ effort ratio**
- Each item shows effort level, estimated % of affected users, element count
- "View Fix" shortcut opens the detail panel directly

### 📈 Scan History & Trend Tracking
- Every completed scan is auto-saved to browser `localStorage` (up to 20 entries)
- Results page shows a sparkline trend chart for the same URL
- "+/- N pts since last scan" trend badge
- Full `/history` page: all past scans grouped by URL with scores, grades, and trends
- Delete individual entries or clear all history

### 🎨 Color Contrast Checker (`/contrast`)
- Pick any foreground/background color with a color picker or hex input
- Live WCAG AA (4.5:1), AA Large Text (3:1), AAA (7:1) pass/fail badges
- Real-time text preview at adjustable font sizes (10–48px)
- Auto-generates accessible alternative colors that pass WCAG AA
- 6 pre-set accessible color palettes

### 📋 One-Click Fix Code Copy
- 📋 copy button on both the "Before" and "After" code blocks in every issue detail panel
- Uses Clipboard API with textarea fallback
- Visual ✅ confirmation that reverts after 2 seconds

### 🔗 Shareable Report Links
- "🔗 Share" button copies the current results URL to clipboard
- Anyone with the link can view the scan while it remains in the server's memory

### 💾 Multi-Format Export
| Format | Contents |
|--------|---------|
| 📄 HTML Report | Styled, self-contained report for sharing with stakeholders |
| 📊 CSV Spreadsheet | Rule ID, impact, description, help, affected elements, WCAG tags — ready for Excel/Sheets |
| 🔧 JSON | Full raw `ScanResult` payload for CI/CD pipelines and custom tooling |

### 📚 25+ Fix Templates
Detailed before/after code fixes, WCAG references, verification steps, and manual remediation guidance for:

`image-alt` · `label` · `color-contrast` · `html-has-lang` · `html-lang-valid` · `document-title` · `link-name` · `button-name` · `heading-order` · `landmark-one-main` · `aria-required-attr` · `aria-valid-attr` · `select-name` · `input-image-alt` · `frame-title` · `duplicate-id` · `tabindex` · `meta-viewport` · `bypass` · `aria-hidden-focus` · `color-contrast-enhanced` · `object-alt` · `scrollable-region-focusable` · `focus-visible` · `autocomplete-valid` · `aria-roles`

### Core Scanning
- Scan any public URL using the industry-standard axe-core engine
- Real-time progress tracking via async polling
- Issues grouped by severity with search and filter chips
- Incomplete checks section for issues needing manual review
- SSRF protection and security controls

### Demo & Learning
- Built-in demo mode — no scanner required, works offline
- Before/after comparison view for 5 common rules
- Sample broken HTML with annotated issues

---

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | Angular | 21 |
| Graph Visualisation | Cytoscape.js | 3.30 |
| Backend | Spring Boot | 3.3.5 |
| Graph Database | **Neo4j** (Spring Data Neo4j) | 5.x / Community |
| Scanner | Node.js + Playwright + axe-core | 18+ |
| Persistence | Neo4j + in-memory fallback | — |
| Build | Maven + npm | — |

---

## Architecture

```
┌─────────────────────────────────────────┐
│   Browser  (Angular SPA)  :4200         │
│                                         │
│  /            → Landing + URL scanner   │
│  /results/:id → Score, Roadmap, History │
│  /graph/:id   → DOM Dependency Graph    │
│  /contrast    → Color Contrast Tool     │
│  /history     → Scan History            │
│  /demo        → Interactive Demo        │
└───────────────┬─────────────────────────┘
                │ REST JSON
                ▼
┌─────────────────────────────────────────┐   ┌──────────────────────┐
│   Spring Boot API  :8081                │   │  Node.js Scanner     │
│   (Spring Data Neo4j)                   ├──►│  :3001               │
│                                         │◄──┤  Playwright + axe-core│
│  POST /api/scans          → start scan  │   └──────────────────────┘
│  GET  /api/scans/{id}     → poll result │
│  GET  /api/scans/{id}/report  → HTML DL │
│  GET  /api/scans/{id}/score   → score   │
│  GET  /api/fixes/{ruleId}     → fix tip │
│  GET  /api/scans/{id}/graph            →│ DOM graph (Cytoscape data)
│  GET  /api/scans/{id}/graph/root-causes →│ Cascading impact analysis
│  GET  /api/scans/{id}/graph/aria-hidden-cascades
│  GET  /api/scans/{id}/graph/wcag-roadmap│ Spec-linked roadmap
│  GET  /api/demo           → demo result │
│  GET  /api/health         → health check│
└───────────────┬─────────────────────────┘
                │ Bolt  :7687
                ▼
┌─────────────────────────────────────────┐
│   Neo4j Graph Database                  │
│                                         │
│  (:DomElement)-[:CONTAINS]->            │
│  (:DomElement)-[:HAS_VIOLATION]->       │
│  (:GraphViolation)-[:VIOLATES]->        │
│  (:WcagCriteria)-[:PART_OF]->           │
│  (:WcagPrinciple)                       │
│                                         │
│  Static: WCAG 2.1 spec graph (seeded)   │
│  Dynamic: DOM tree per scan             │
└─────────────────────────────────────────┘
```

---

## Installation & Setup

### Prerequisites

- **Node.js** 18+ (LTS)
- **Java** 17+ (JDK)
- **Maven** 3.6+
- **npm** 7+
- **Neo4j** 5.x Community Edition (or AuraDB Free tier)

### Steps

#### 1. Clone the repository

```bash
git clone https://github.com/pranaymakkena/accesslens.git
cd accesslens/prototype
```

#### 2. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

#### 3. Install scanner dependencies

```bash
cd scanner
npm install
npx playwright install chromium
cd ..
```

#### 4. Build the backend

```bash
cd backend
mvn clean install
cd ..
```

#### 5. Start Neo4j

**Option A — Neo4j Desktop (local, recommended for development):**
1. Download from https://neo4j.com/download/
2. Create a new database with password `accesslens`
3. Start the database (it runs on Bolt port 7687 by default)

**Option B — AuraDB Free (cloud, no install):**
1. Sign up at https://neo4j.com/cloud/platform/aura-graph-database/
2. Create a free instance, copy the connection URI + credentials
3. Update `backend/src/main/resources/application.properties`:
   ```properties
   spring.neo4j.uri=neo4j+s://<your-aura-id>.databases.neo4j.io
   spring.neo4j.authentication.username=neo4j
   spring.neo4j.authentication.password=<your-password>
   ```

**Option C — Docker (one command):**
```bash
docker run -d --name accesslens-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/accesslens \
  neo4j:5-community
```

> **Note:** AccessLens works without Neo4j — the graph features degrade gracefully (the `/graph/:id` page shows an informational message). All other scan, score, and export features remain fully functional.

---

## Running the Application

Start all services in separate terminals:

**Terminal 1 — Neo4j (skip if using AuraDB or Docker)**
```bash
# Start Neo4j Desktop, or if using Docker:
docker start accesslens-neo4j
# Verify: open http://localhost:7474 in your browser
```

**Terminal 2 — Scanner (http://localhost:3001)**
```bash
cd prototype/scanner
npm start
```

**Terminal 3 — Backend API (http://localhost:8081)**
```bash
cd prototype/backend
mvn spring-boot:run
# On first run: WCAG 2.1 spec graph is seeded into Neo4j automatically
```

**Terminal 4 — Frontend (http://localhost:4200)**
```bash
cd prototype/frontend
ng serve --open
```

### Verify everything is running

```bash
curl http://localhost:3001/health
curl http://localhost:8081/api/health
# Then open http://localhost:4200
```

---

## Using the Application

### Scanning a Website

1. Navigate to **http://localhost:4200**
2. Enter any public URL (e.g. `https://example.com`)
3. Click **Scan Website** — results arrive in under 30 seconds

### Reading Results

- **Score widget** — 0–100 score with letter grade and severity breakdown
- **WCAG Principle chart** — see which of the 4 principles needs the most work
- **Smart Fix Roadmap** — your prioritised "fix these first" list
- **Scan History** — sparkline trend for this URL's past scores
- **Violation cards** — grouped by impact, searchable and filterable
- **Issue detail panel** — click "View Details & Fix" on any card for the full fix guide

### Accessing the DOM Dependency Graph

After a scan completes, click **🕸️ Dependency Graph** on the results header. The graph page shows:

1. **Visual DOM Map** — interactive Cytoscape.js graph. Click any node for its selector, violation rules, and accessibility attributes.
2. **Cascading Impact Analysis** — ancestor components ranked by how many violations cascade from them.
3. **aria-hidden Cascade Warnings** — subtrees that are silently hidden from assistive technology.
4. **WCAG Specification Roadmap** — every violated criterion linked to the W3C spec with violation counts.

> Graph data builds asynchronously in Neo4j after the scan completes (typically 1–3 seconds). If Neo4j is not running, the page shows a setup guide instead of the graph.

Click **⬇️ Export** on the results header and choose:
- **HTML Report** — share with stakeholders
- **CSV Spreadsheet** — open in Excel/Google Sheets
- **JSON** — feed into CI/CD pipelines

### Color Contrast Checker

Navigate to **/contrast** (or click "Contrast" in the nav) to:
1. Pick a foreground and background color
2. Instantly see WCAG AA/AAA pass/fail
3. Preview text at different sizes
4. Get auto-generated accessible alternative colors

### Scan History

Navigate to **/history** (or click "History" in the nav) to:
- See all past scans grouped by URL
- Track score trends over time
- Click any row to re-open that scan's results

---

## API Reference

| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/scans` | Start a new scan. Body: `{ "url": "https://..." }` |
| `GET` | `/api/scans/{id}` | Poll scan status and result |
| `GET` | `/api/scans/{id}/report` | Download HTML report |
| `GET` | `/api/scans/{id}/score` | Get accessibility score and grade |
| `GET` | `/api/fixes/{ruleId}` | Get fix suggestion for a rule |
| `GET` | `/api/demo` | Get demo scan result (no scanner needed) |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/scans/{id}/graph` | Cytoscape.js graph elements (nodes + edges) |
| `GET` | `/api/scans/{id}/graph/root-causes` | Cascading impact: top ancestor components |
| `GET` | `/api/scans/{id}/graph/aria-hidden-cascades` | aria-hidden subtree blocking analysis |
| `GET` | `/api/scans/{id}/graph/wcag-roadmap` | Spec-linked WCAG compliance roadmap |

### Score response example

```json
{
  "score": 74,
  "grade": "C",
  "critical": 1,
  "serious": 2,
  "moderate": 3,
  "minor": 1,
  "totalViolations": 7,
  "totalPassed": 38
}
```

---

## Known Limitations

1. **Neo4j Required for Graph Features:** The DOM Dependency Graph, Cascading Impact Analysis, aria-hidden cascade detection, and WCAG Specification Roadmap require a running Neo4j instance. All other features (scan, score, history, contrast tool, exports) work without Neo4j — the graph page degrades gracefully with an informational message.

2. **In-Memory Scan Store:** Individual scan results are also stored in a `ConcurrentHashMap` (100-scan LRU cap) for fast polling. Scan results are lost on backend restart. Neo4j is the persistent store for graph data.

3. **Automated Coverage:** axe-core detects ~30–40% of WCAG 2.1 criteria. Manual testing with real assistive technologies is always required for full compliance.

4. **Scan History is Browser-Local:** Trend history is stored in `localStorage`. Clearing browser data will erase it. Server-side history requires a user account system (roadmap item).

5. **No Authentication:** The API has no user authentication. Add rate limiting and auth before any public deployment.

6. **Single Browser Engine:** Chromium only. Safari and Firefox rendering differences are not captured.

---

## Security Considerations

### SSRF Protection (Scanner Service)

- Blocks private IP ranges (10.x, 172.16–31.x, 192.168.x, 127.x)
- Blocks cloud metadata endpoints (169.254.169.254)
- Allows only HTTP/HTTPS on ports 80 and 443
- Validates and re-validates DNS on redirects
- 30-second scan timeout, max 3 concurrent scans

See [SECURITY.md](SECURITY.md) for the full security model.

---

## Troubleshooting

### "Cannot connect to the AccessLens backend"

The frontend expects the backend on port **8081** (not 8080).

```bash
curl http://localhost:8081/api/health
```

If that fails, start the backend:
```bash
cd backend && mvn spring-boot:run
```

### "Scan failed: Request timeout"

The scanner service is not running:
```bash
cd scanner && npm start
curl http://localhost:3001/health
```

### "Failed to launch browser"

Re-install Playwright browsers:
```bash
cd scanner
npx playwright install chromium
# Linux only:
sudo npx playwright install-deps chromium
```

### Port already in use

```bash
# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

---

## Project Structure

```
prototype/
├── frontend/               # Angular 21 SPA
│   └── src/app/
│       ├── pages/
│       │   ├── landing/    # Home page with URL scanner
│       │   ├── results/    # Scan results with score, roadmap, history
│       │   ├── graph/      # 🕸️ DOM Dependency Graph + Neo4j analysis
│       │   ├── demo/       # Interactive demo (no scan needed)
│       │   ├── contrast/   # Color contrast checker tool
│       │   └── history/    # Full scan history page
│       ├── components/
│       │   ├── dom-graph/            # Cytoscape.js graph visualiser
│       │   ├── root-cause-panel/     # Cascading impact + aria-hidden + WCAG panels
│       │   ├── score-widget/         # 0–100 score ring
│       │   ├── wcag-breakdown/       # 4-principle coverage chart
│       │   ├── remediation-roadmap/  # Priority fix list
│       │   ├── scan-history/         # Per-URL history sparkline
│       │   ├── issue-card/           # Violation summary card
│       │   └── issue-detail/         # Fix detail slide-over panel
│       └── services/
│           ├── scan.service.ts                # API calls + graph endpoints + exports
│           └── accessibility-score.service.ts # Score, WCAG, roadmap, history
│
├── backend/                # Spring Boot 3.3.5
│   └── src/main/java/com/accesslens/api/
│       ├── controller/     # REST endpoints (includes graph endpoints)
│       ├── graph/          # 🕸️ Neo4j layer
│       │   ├── DomElementNode.java          # (:DomElement) entity
│       │   ├── GraphViolationNode.java       # (:GraphViolation) entity
│       │   ├── WcagCriteriaNode.java         # (:WcagCriteria) entity
│       │   ├── WcagPrincipleNode.java        # (:WcagPrinciple) entity
│       │   ├── DomElementRepository.java     # Cypher queries incl. cascading analysis
│       │   ├── WcagCriteriaRepository.java   # Spec-linked roadmap query
│       │   ├── GraphAnalysisService.java     # DOM→graph builder + query layer
│       │   └── WcagSeedService.java          # Seeds WCAG 2.1 spec on startup
│       ├── service/
│       │   ├── ScanService.java              # Async scan + triggers graph build
│       │   ├── ScannerServiceClient.java     # WebFlux call to scanner
│       │   ├── FixSuggestionService.java     # 25+ fix templates
│       │   └── ScanStore.java                # In-memory result store (100 cap)
│       ├── model/          # ScanResult, Violation, ViolationNode, ScanStatus
│       └── dto/            # ScanRequest, ScanInitResponse, FixSuggestion
│
└── scanner/                # Node.js + Playwright + axe-core
```

---

## Roadmap

### Version 1.2 (Planned)
- PDF export with full accessibility report
- Keyboard navigation audit (dedicated checks beyond axe-core)
- Neo4j graph export as GraphML / JSON-LD for external tooling
- Graph-based CI/CD badge (score + grade as SVG)

### Version 2.0 (Planned)
- Team workspaces with shared scan history stored in Neo4j
- Scheduled re-scans with email notifications and graph diff
- GitHub Actions integration — fail PRs below a score threshold
- REST API key authentication
- Docker Compose stack (all four services in one command)

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Areas where help is most valuable:
- Adding fix templates for additional axe-core rules
- Testing on real assistive technologies (NVDA, JAWS, VoiceOver)
- Improving scanner robustness for edge-case URLs
- PostgreSQL persistence implementation

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## References

- [W3C Web Accessibility Initiative](https://www.w3.org/WAI/)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core](https://github.com/dequelabs/axe-core)
- [Playwright](https://playwright.dev/)
- [Angular](https://angular.dev/)
- [Spring Boot](https://spring.io/projects/spring-boot)

---

**Built with ❤️ for accessibility.**
