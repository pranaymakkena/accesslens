import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ScanService } from '../../services/scan.service';
import { GraphData, RootCauseComponent, AriaHiddenCascade, WcagGraphCriteria } from '../../models/scan.models';
import { DomGraphComponent } from '../../components/dom-graph/dom-graph.component';
import { RootCausePanelComponent } from '../../components/root-cause-panel/root-cause-panel.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-graph',
  imports: [CommonModule, RouterLink, DomGraphComponent, RootCausePanelComponent],
  template: `
    <div class="graph-page">
      <!-- Header -->
      <header class="graph-header">
        <div class="container">
          <div class="header-row">
            <a [routerLink]="['/results', scanId]" class="btn btn-secondary btn-sm">← Back to Results</a>
            <div class="header-info">
              <h1 class="page-title">🕸️ Accessibility Dependency Graph</h1>
              <p class="page-sub" *ngIf="scanUrl">
                DOM accessibility tree for <strong>{{ scanUrl }}</strong>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div class="container graph-body">

        <!-- Loading -->
        <div class="loading-state card" *ngIf="loading" role="status" aria-live="polite">
          <div class="spinner" aria-hidden="true"></div>
          <span>Loading graph data from Neo4j…</span>
        </div>

        <!-- Neo4j unavailable notice -->
        <div class="alert alert-info neo4j-notice" *ngIf="!loading && neo4jUnavailable">
          <span aria-hidden="true">ℹ️</span>
          <div>
            <strong>Neo4j graph not available.</strong>
            The graph analysis requires a running Neo4j instance.
            Start Neo4j and re-scan to populate graph data.
            <br>
            <a href="https://neo4j.com/download/" target="_blank" rel="noopener" class="btn btn-secondary btn-sm mt-2">
              Download Neo4j →
            </a>
          </div>
        </div>

        <!-- Cytoscape graph -->
        <section class="graph-section" *ngIf="!loading && !neo4jUnavailable && graphData" aria-labelledby="graph-section-heading">
          <h2 id="graph-section-heading" class="section-heading">
            Visual DOM Accessibility Map
            <span class="heading-badge">{{ graphData.nodeCount }} nodes</span>
          </h2>
          <p class="section-desc">
            Nodes are colour-coded by highest violation severity.
            Dashed hexagon border = <code>aria-hidden</code> cascade.
            Diamond shape = Shadow DOM element.
            Click any node to inspect it.
          </p>
          <app-dom-graph [graphData]="graphData"></app-dom-graph>
        </section>

        <!-- Analysis panels -->
        <section class="analysis-section" *ngIf="!loading && !neo4jUnavailable" aria-label="Graph-based analysis results">
          <h2 class="section-heading">Graph-Powered Analysis</h2>

          <app-root-cause-panel
            [rootCauses]="rootCauses"
            [ariaHiddenCascades]="ariaHiddenCascades"
            [wcagRoadmap]="wcagRoadmap">
          </app-root-cause-panel>

          <div class="no-data-card card" *ngIf="!rootCauses.length && !ariaHiddenCascades.length && !wcagRoadmap.length">
            <div class="no-data-icon" aria-hidden="true">✅</div>
            <h3>No cascading issues detected</h3>
            <p>The graph analysis found no multi-violation ancestor components or aria-hidden cascades on this scan.</p>
          </div>
        </section>

        <!-- How it works explainer -->
        <section class="explainer card" aria-labelledby="explainer-heading">
          <h2 id="explainer-heading" class="explainer-title">How the Neo4j Graph Works</h2>
          <div class="explainer-grid">
            <div class="explainer-step">
              <span class="step-icon" aria-hidden="true">1️⃣</span>
              <h3>DOM → Graph</h3>
              <p>After every scan, AccessLens parses each violation's CSS selector into a parent-child chain and stores every DOM element as a <code>(:DomElement)</code> node connected by <code>[:CONTAINS]</code> edges.</p>
            </div>
            <div class="explainer-step">
              <span class="step-icon" aria-hidden="true">2️⃣</span>
              <h3>Violation Nodes</h3>
              <p>Each violation becomes a <code>(:GraphViolation)</code> node linked via <code>[:HAS_VIOLATION]</code> to its element, and via <code>[:VIOLATES]</code> to the relevant <code>(:WcagCriteria)</code> specification node.</p>
            </div>
            <div class="explainer-step">
              <span class="step-icon" aria-hidden="true">3️⃣</span>
              <h3>Cascading Analysis</h3>
              <p>A Cypher graph traversal (<code>CONTAINS*1..</code>) walks up the ancestor tree to find nodes whose subtrees concentrate the most violations — the "root cause components."</p>
            </div>
            <div class="explainer-step">
              <span class="step-icon" aria-hidden="true">4️⃣</span>
              <h3>WCAG Spec Linking</h3>
              <p>The WCAG 2.1 specification is pre-seeded as a static sub-graph. Live violations are dynamically linked to it, enabling spec-aware prioritisation that no other tool provides.</p>
            </div>
          </div>
          <div class="cypher-box">
            <div class="cypher-label">Example Cypher — Cascading Impact Query</div>
            <pre class="code-block">{{ cipherExample }}</pre>
          </div>
        </section>

      </div>
    </div>
  `,
  styles: [`
    .graph-page { min-height:100vh; background:var(--bg); }
    .graph-header { background:white; border-bottom:1px solid var(--border); padding:1.25rem 0; }
    .header-row { display:flex; align-items:flex-start; gap:1rem; flex-wrap:wrap; }
    .header-info { flex:1; }
    .page-title { font-size:1.5rem; margin-bottom:0.25rem; }
    .page-sub { font-size:0.875rem; color:var(--text-secondary); }
    .graph-body { padding:2rem 0 4rem; display:flex; flex-direction:column; gap:2rem; }
    .loading-state { display:flex; align-items:center; gap:1rem; padding:2rem; font-size:0.9rem; color:var(--text-secondary); }
    .neo4j-notice { font-size:0.9rem; }
    .section-heading { font-size:1.1rem; font-weight:600; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.75rem; }
    .heading-badge { background:var(--primary-light); color:var(--primary); font-size:0.75rem;
      padding:0.15rem 0.6rem; border-radius:100px; font-weight:600; }
    .section-desc { font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem; }
    .no-data-card { text-align:center; padding:2.5rem; }
    .no-data-icon { font-size:2.5rem; margin-bottom:0.75rem; }
    .no-data-card h3 { margin-bottom:0.5rem; }
    .no-data-card p { color:var(--text-secondary); font-size:0.875rem; }
    .explainer { padding:2rem; }
    .explainer-title { font-size:1.1rem; font-weight:600; margin-bottom:1.25rem; }
    .explainer-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1.25rem; margin-bottom:1.5rem; }
    .explainer-step { }
    .step-icon { font-size:1.25rem; display:block; margin-bottom:0.5rem; }
    .explainer-step h3 { font-size:0.9rem; font-weight:600; margin-bottom:0.375rem; }
    .explainer-step p { font-size:0.825rem; color:var(--text-secondary); line-height:1.6; }
    .cypher-box { margin-top:1rem; }
    .cypher-label { font-size:0.75rem; font-weight:600; color:var(--text-muted);
      text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.5rem; }
    @media(max-width:600px){ .page-title{font-size:1.2rem;} }
  `]
})
export class GraphComponent implements OnInit {
  scanId = '';
  scanUrl = '';
  loading = true;
  neo4jUnavailable = false;

  graphData: GraphData | null = null;
  rootCauses: RootCauseComponent[] = [];
  ariaHiddenCascades: AriaHiddenCascade[] = [];
  wcagRoadmap: WcagGraphCriteria[] = [];

  readonly cipherExample = `MATCH (ancestor:DomElement {scanId: $scanId})
MATCH (ancestor)-[:CONTAINS*1..]->(desc:DomElement)
      -[:HAS_VIOLATION]->(v:GraphViolation)
WITH ancestor, count(DISTINCT v.ruleId) AS distinctRules,
     count(v) AS totalViolations
WHERE distinctRules > 1
RETURN ancestor.selector, distinctRules, totalViolations
ORDER BY totalViolations DESC LIMIT 10`;

  constructor(private route: ActivatedRoute, private scanService: ScanService) {}

  ngOnInit(): void {
    this.scanId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.scanId) return;

    forkJoin({
      graph:    this.scanService.getDomGraph(this.scanId).pipe(catchError(() => of(null))),
      roots:    this.scanService.getRootCauses(this.scanId).pipe(catchError(() => of([]))),
      cascades: this.scanService.getAriaHiddenCascades(this.scanId).pipe(catchError(() => of([]))),
      wcag:     this.scanService.getWcagGraphRoadmap(this.scanId).pipe(catchError(() => of([]))),
      scan:     this.scanService.getScan(this.scanId).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ graph, roots, cascades, wcag, scan }) => {
        this.loading = false;
        if (graph === null && (roots as any[]).length === 0) {
          this.neo4jUnavailable = true;
        }
        if (graph) this.graphData = graph;
        this.rootCauses = (roots as RootCauseComponent[]) || [];
        this.ariaHiddenCascades = (cascades as AriaHiddenCascade[]) || [];
        this.wcagRoadmap = (wcag as WcagGraphCriteria[]) || [];
        if (scan) this.scanUrl = (scan as any).url || '';
      },
      error: () => {
        this.loading = false;
        this.neo4jUnavailable = true;
      }
    });
  }
}
