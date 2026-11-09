import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ScanService } from '../../services/scan.service';
import { AccessibilityScoreService } from '../../services/accessibility-score.service';
import { ScanResult, Violation, ImpactGroup, ImpactLevel, AccessibilityScore, WcagPrincipleBreakdown, RemediationItem } from '../../models/scan.models';
import { IssueCardComponent } from '../../components/issue-card/issue-card.component';
import { IssueDetailComponent } from '../../components/issue-detail/issue-detail.component';
import { ScanProgressComponent } from '../../components/scan-progress/scan-progress.component';
import { SeverityBadgeComponent } from '../../components/severity-badge/severity-badge.component';
import { EmptyGroupsPipe } from '../../models/empty-groups.pipe';
import { ScoreWidgetComponent } from '../../components/score-widget/score-widget.component';
import { WcagBreakdownComponent } from '../../components/wcag-breakdown/wcag-breakdown.component';
import { RemediationRoadmapComponent } from '../../components/remediation-roadmap/remediation-roadmap.component';
import { ScanHistoryComponent } from '../../components/scan-history/scan-history.component';

@Component({
  selector: 'app-results',
  imports: [
    CommonModule, FormsModule, RouterLink,
    IssueCardComponent, IssueDetailComponent,
    ScanProgressComponent, SeverityBadgeComponent, EmptyGroupsPipe,
    ScoreWidgetComponent, WcagBreakdownComponent,
    RemediationRoadmapComponent, ScanHistoryComponent,
  ],
  template: `
    <!-- Loading state -->
    <app-scan-progress *ngIf="loading" [url]="scanUrl"></app-scan-progress>

    <!-- Error state -->
    <div class="container error-state" *ngIf="error && !loading" role="alert">
      <div class="card error-card">
        <div class="error-icon" aria-hidden="true">❌</div>
        <h2>Scan failed</h2>
        <p>{{ error }}</p>
        <a routerLink="/" class="btn btn-primary mt-3">Try another URL</a>
      </div>
    </div>

    <!-- Results state -->
    <div class="results-page" *ngIf="result && !loading">
      <!-- Summary header -->
      <header class="results-header">
        <div class="container">
          <div class="results-meta">
            <a routerLink="/" class="btn btn-secondary btn-sm back-btn">← New Scan</a>
            <div class="scanned-url-info">
              <span class="scanned-label">Scanned:</span>
              <a [href]="result.url" target="_blank" rel="noopener noreferrer" class="scanned-url">{{ result.url }}</a>
              <span class="scan-time">{{ result.timestamp | date:'medium' }}</span>
            </div>
            <button class="btn btn-secondary btn-sm share-btn" (click)="copyShareLink()" type="button"
                    [attr.aria-label]="shareCopied ? 'Link copied!' : 'Copy shareable link'">
              {{ shareCopied ? '✅ Copied!' : '🔗 Share' }}
            </button>
          </div>

          <div class="results-summary">
            <div class="summary-stat" [class.stat-danger]="result.violationCount > 0">
              <span class="stat-value">{{ result.violationCount }}</span>
              <span class="stat-label">Violation{{ result.violationCount !== 1 ? 's' : '' }}</span>
            </div>
            <div class="summary-stat stat-success">
              <span class="stat-value">{{ result.passCount }}</span>
              <span class="stat-label">Passed</span>
            </div>
            <div class="summary-stat stat-warning" *ngIf="result.incompleteCount > 0">
              <span class="stat-value">{{ result.incompleteCount }}</span>
              <span class="stat-label">Needs Review</span>
            </div>
          </div>

          <div class="results-actions">
            <!-- Graph analysis link -->
            <a [routerLink]="['/graph', scanId]" class="btn btn-outline graph-btn">
              🕸️ Dependency Graph
            </a>
            <!-- Export dropdown -->
            <div class="export-group" #exportGroup>
              <button class="btn btn-primary export-toggle" (click)="exportMenuOpen = !exportMenuOpen"
                      type="button" [attr.aria-expanded]="exportMenuOpen" aria-haspopup="menu">
                ⬇️ Export <span class="caret" aria-hidden="true">▾</span>
              </button>
              <div class="export-menu" *ngIf="exportMenuOpen" role="menu">
                <button class="export-item" (click)="downloadHtml()" type="button" role="menuitem">📄 HTML Report</button>
                <button class="export-item" (click)="downloadCsv()" type="button" role="menuitem">📊 CSV Spreadsheet</button>
                <button class="export-item" (click)="downloadJson()" type="button" role="menuitem">🔧 JSON (raw data)</button>
              </div>
            </div>
            <a routerLink="/" class="btn btn-secondary">Scan Another URL</a>
          </div>
        </div>
      </header>

      <div class="container results-content">

        <!-- Score + WCAG Breakdown row -->
        <div class="insights-grid" *ngIf="accessScore">
          <app-score-widget [score]="accessScore" [wcagBreakdown]="wcagBreakdown"></app-score-widget>
          <app-wcag-breakdown [breakdown]="wcagBreakdown"></app-wcag-breakdown>
        </div>

        <!-- Remediation Roadmap -->
        <app-remediation-roadmap
          *ngIf="roadmap.length > 0"
          [items]="roadmap"
          (viewFix)="openDetail($event)"
          class="roadmap-wrap">
        </app-remediation-roadmap>

        <!-- Scan History for this URL -->
        <app-scan-history
          [currentUrl]="result.url"
          [currentId]="result.id"
          class="history-wrap">
        </app-scan-history>

        <!-- No violations -->
        <div class="no-violations card" *ngIf="result.violationCount === 0">
          <div class="no-v-icon" aria-hidden="true">✅</div>
          <h2>No violations detected</h2>
          <p>axe-core found no detectable violations on this page.
            <strong>This does not mean the page is fully accessible.</strong>
            Automated tools detect only a subset of issues — also test manually with a screen reader and keyboard navigation.
          </p>
        </div>

        <!-- Violations found -->
        <div *ngIf="result.violationCount > 0">
          <!-- Filters -->
          <div class="filters-bar" role="search" aria-label="Filter issues">
            <div class="search-box">
              <label for="issue-search" class="sr-only">Search issues by rule name</label>
              <span aria-hidden="true">🔍</span>
              <input id="issue-search" type="search" [(ngModel)]="searchQuery"
                     (ngModelChange)="applyFilters()" placeholder="Search issues..."
                     class="search-input" aria-label="Search issues by rule name or description" />
            </div>
            <div class="filter-chips" role="group" aria-label="Filter by severity">
              <button *ngFor="let f of impactFilters" class="filter-chip"
                      [class.active]="activeFilter === f.value"
                      (click)="setFilter(f.value)" type="button"
                      [attr.aria-pressed]="activeFilter === f.value">
                {{ f.label }}
                <span class="filter-count">{{ f.count }}</span>
              </button>
            </div>
          </div>

          <!-- Impact groups -->
          <div *ngFor="let group of filteredGroups">
            <div class="impact-group-header" *ngIf="group.violations.length > 0">
              <app-severity-badge [impact]="group.impact"></app-severity-badge>
              <h2 class="group-title">{{ group.label }} ({{ group.violations.length }})</h2>
            </div>
            <div class="issues-list">
              <app-issue-card *ngFor="let v of group.violations" [violation]="v"
                              (viewDetails)="openDetail($event)"></app-issue-card>
            </div>
          </div>

          <!-- Empty filter state -->
          <div class="empty-filter card" *ngIf="filteredGroups | emptyGroups">
            <p>No issues match the current filter.
              <button class="link-btn" (click)="clearFilters()" type="button">Clear filters</button>
            </p>
          </div>
        </div>

        <!-- Incomplete checks -->
        <section class="incomplete-section" *ngIf="result.incompleteCount > 0" aria-labelledby="incomplete-heading">
          <h2 id="incomplete-heading" class="section-header">Needs Manual Review ({{ result.incompleteCount }})</h2>
          <p class="section-desc">These checks could not be completed automatically and require manual investigation.</p>
          <div class="issues-list">
            <app-issue-card *ngFor="let v of result.incomplete" [violation]="v"
                            (viewDetails)="openDetail($event)"></app-issue-card>
          </div>
        </section>

        <!-- Disclaimer -->
        <div class="alert alert-warning disclaimer-block" role="note">
          <span aria-hidden="true">⚠️</span>
          <div>
            <strong>Automated testing limitation:</strong> This report covers violations detected automatically by axe-core.
            It does not represent full WCAG compliance. Always test with real assistive technologies and involve users with disabilities where possible.
          </div>
        </div>
      </div>
    </div>

    <!-- Issue detail panel -->
    <app-issue-detail *ngIf="selectedViolation" [violation]="selectedViolation"
                      (close)="closeDetail()"></app-issue-detail>

    <!-- Export menu backdrop -->
    <div class="menu-backdrop" *ngIf="exportMenuOpen" (click)="exportMenuOpen = false"
         aria-hidden="true"></div>
  `,
  styles: [`
    .error-state { padding: 4rem 1rem; }
    .error-card { text-align: center; padding: 3rem; max-width: 480px; margin: 0 auto; }
    .error-icon { font-size: 3rem; margin-bottom: 1rem; }
    .results-header { background: white; border-bottom: 1px solid var(--border); padding: 1.5rem 0; }
    .results-meta { display:flex; align-items:center; gap:1rem; flex-wrap:wrap; margin-bottom:1.25rem; }
    .scanned-url-info { display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; flex:1; min-width:0; }
    .scanned-label { font-size:0.8125rem; color:var(--text-muted); font-weight:500; }
    .scanned-url { font-size:0.9375rem; font-weight:600; color:var(--primary); word-break:break-all; }
    .scan-time { font-size:0.8125rem; color:var(--text-muted); }
    .share-btn { white-space:nowrap; }
    .results-summary { display:flex; gap:2rem; margin-bottom:1.25rem; flex-wrap:wrap; }
    .summary-stat { display:flex; flex-direction:column; }
    .stat-value { font-size:2rem; font-weight:700; line-height:1; }
    .stat-label { font-size:0.8125rem; color:var(--text-secondary); margin-top:0.25rem; }
    .stat-danger .stat-value { color:var(--danger); }
    .stat-success .stat-value { color:var(--success); }
    .stat-warning .stat-value { color:var(--moderate); }
    .results-actions { display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center; }
    .graph-btn { font-weight:600; }
    .export-group { position:relative; }
    .export-toggle { gap:0.375rem; }
    .caret { font-size:0.75rem; }
    .export-menu { position:absolute; top:calc(100% + 4px); left:0; background:white;
      border:1px solid var(--border); border-radius:var(--radius); box-shadow:var(--shadow-lg);
      min-width:180px; z-index:200; overflow:hidden; }
    .export-item { display:block; width:100%; padding:0.625rem 1rem; background:none; border:none;
      text-align:left; font-family:inherit; font-size:0.875rem; cursor:pointer; transition:background 0.1s; }
    .export-item:hover { background:var(--surface-2); }
    .menu-backdrop { position:fixed; inset:0; z-index:150; }
    .results-content { padding:2rem 0 4rem; }
    .insights-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem; }
    .roadmap-wrap { display:block; margin-bottom:1.5rem; }
    .history-wrap { display:block; margin-bottom:2rem; }
    .no-violations { text-align:center; padding:3rem; margin-bottom:2rem; }
    .no-v-icon { font-size:3rem; margin-bottom:1rem; }
    .no-violations h2 { margin-bottom:0.75rem; color:var(--success); }
    .no-violations p { color:var(--text-secondary); max-width:520px; margin:0 auto; line-height:1.7; }
    .filters-bar { display:flex; align-items:center; gap:1rem; flex-wrap:wrap; margin-bottom:2rem;
      padding:1rem; background:white; border:1px solid var(--border); border-radius:var(--radius-lg); }
    .search-box { display:flex; align-items:center; gap:0.5rem; background:var(--surface-2);
      border:1px solid var(--border); border-radius:var(--radius); padding:0.4rem 0.75rem;
      flex:1; min-width:200px; }
    .search-input { border:none; outline:none; background:transparent; font-family:inherit;
      font-size:0.9rem; width:100%; color:var(--text); }
    .filter-chips { display:flex; gap:0.5rem; flex-wrap:wrap; }
    .filter-chip { display:flex; align-items:center; gap:0.375rem; padding:0.375rem 0.75rem;
      border:1.5px solid var(--border); border-radius:100px; background:white;
      font-size:0.8125rem; font-weight:500; cursor:pointer; transition:all 0.15s; font-family:inherit; }
    .filter-chip:hover { border-color:var(--primary); color:var(--primary); }
    .filter-chip.active { background:var(--primary); border-color:var(--primary); color:white; }
    .filter-count { background:rgba(0,0,0,0.1); padding:0.1rem 0.4rem; border-radius:100px; font-size:0.75rem; }
    .filter-chip.active .filter-count { background:rgba(255,255,255,0.25); }
    .impact-group-header { display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem; margin-top:2rem; }
    .group-title { font-size:1rem; font-weight:600; }
    .issues-list { display:flex; flex-direction:column; gap:0.75rem; margin-bottom:1rem; }
    .empty-filter { text-align:center; padding:2rem; color:var(--text-secondary); }
    .link-btn { background:none; border:none; color:var(--primary); cursor:pointer;
      font-family:inherit; font-size:inherit; text-decoration:underline; }
    .incomplete-section { margin-top:3rem; }
    .section-header { font-size:1.25rem; margin-bottom:0.5rem; }
    .section-desc { color:var(--text-secondary); font-size:0.9rem; margin-bottom:1.25rem; }
    .disclaimer-block { margin-top:2rem; }
    .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden;
      clip:rect(0,0,0,0); white-space:nowrap; border:0; }
    @media(max-width:800px){ .insights-grid{grid-template-columns:1fr;} }
  `]
})
export class ResultsComponent implements OnInit, OnDestroy {
  result: ScanResult | null = null;
  loading = true;
  error = '';
  scanUrl = '';
  selectedViolation: Violation | null = null;
  searchQuery = '';
  activeFilter: ImpactLevel | 'all' = 'all';
  filteredGroups: ImpactGroup[] = [];
  impactFilters: Array<{ label: string; value: ImpactLevel | 'all'; count: number }> = [];
  accessScore: AccessibilityScore | null = null;
  wcagBreakdown: WcagPrincipleBreakdown[] = [];
  roadmap: RemediationItem[] = [];
  exportMenuOpen = false;
  shareCopied = false;

  private sub?: Subscription;
  scanId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scanService: ScanService,
    private scoreService: AccessibilityScoreService,
  ) {}

  ngOnInit(): void {
    this.scanId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.scanId) { this.router.navigate(['/']); return; }

    this.sub = this.scanService.pollScan(this.scanId).subscribe({
      next: res => {
        this.scanUrl = res.url;
        if (res.status === 'COMPLETE' || res.status === 'FAILED') {
          this.loading = false;
          if (res.status === 'FAILED') {
            this.error = res.error || 'The scan failed. Please try again.';
          } else {
            this.result = res;
            this.buildFilters();
            this.applyFilters();
            this.computeInsights();
            this.saveHistory();
          }
        }
      },
      error: (err: Error) => {
        this.loading = false;
        this.error = err.message || 'Failed to retrieve scan results.';
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private computeInsights(): void {
    if (!this.result) return;
    this.accessScore = this.scoreService.computeScore(this.result);
    this.wcagBreakdown = this.scoreService.computeWcagBreakdown(this.result);
    this.roadmap = this.scoreService.computeRemediationRoadmap(this.result);
  }

  private saveHistory(): void {
    if (this.result && this.accessScore) {
      this.scoreService.saveToHistory(this.result, this.accessScore);
    }
  }

  buildFilters(): void {
    if (!this.result) return;
    const counts: Record<string, number> = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    this.result.violations.forEach(v => { if (v.impact && counts[v.impact] !== undefined) counts[v.impact]++; });
    this.impactFilters = ([
      { label: 'All', value: 'all' as const, count: this.result.violationCount },
      { label: 'Critical', value: 'critical' as ImpactLevel, count: counts['critical'] },
      { label: 'Serious', value: 'serious' as ImpactLevel, count: counts['serious'] },
      { label: 'Moderate', value: 'moderate' as ImpactLevel, count: counts['moderate'] },
      { label: 'Minor', value: 'minor' as ImpactLevel, count: counts['minor'] }
    ] as Array<{ label: string; value: ImpactLevel | 'all'; count: number }>)
      .filter(f => f.value === 'all' || f.count > 0);
  }

  applyFilters(): void {
    if (!this.result) return;
    const q = this.searchQuery.toLowerCase();
    const impacts: ImpactLevel[] = ['critical', 'serious', 'moderate', 'minor'];
    this.filteredGroups = impacts.map(impact => {
      const violations = this.result!.violations.filter(v => {
        const impactMatch = this.activeFilter === 'all' || v.impact === this.activeFilter;
        const searchMatch = !q || v.id.toLowerCase().includes(q) || v.description.toLowerCase().includes(q) || v.help.toLowerCase().includes(q);
        return v.impact === impact && impactMatch && searchMatch;
      });
      return {
        impact, label: (impact as string).charAt(0).toUpperCase() + (impact as string).slice(1),
        color: `var(--${impact})`, violations,
      };
    });
  }

  setFilter(value: ImpactLevel | 'all'): void {
    this.activeFilter = value;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.activeFilter = 'all';
    this.applyFilters();
  }

  openDetail(violation: Violation): void {
    this.selectedViolation = violation;
    document.body.style.overflow = 'hidden';
    this.exportMenuOpen = false;
  }

  closeDetail(): void {
    this.selectedViolation = null;
    document.body.style.overflow = '';
  }

  downloadHtml(): void {
    this.exportMenuOpen = false;
    this.scanService.downloadReport(this.scanId);
  }

  downloadCsv(): void {
    this.exportMenuOpen = false;
    if (this.result) this.scanService.downloadCsv(this.result);
  }

  downloadJson(): void {
    this.exportMenuOpen = false;
    if (this.result) this.scanService.downloadJson(this.result);
  }

  copyShareLink(): void {
    this.scanService.copyToClipboard(window.location.href).then(() => {
      this.shareCopied = true;
      setTimeout(() => (this.shareCopied = false), 2500);
    });
  }
}
