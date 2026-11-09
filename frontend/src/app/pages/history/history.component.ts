import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccessibilityScoreService } from '../../services/accessibility-score.service';
import { ScanHistoryEntry } from '../../models/scan.models';

@Component({
  selector: 'app-history',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="history-page container">
      <header class="page-header">
        <a routerLink="/" class="btn btn-secondary btn-sm back-btn">← Back to Scanner</a>
        <div>
          <h1>📊 Scan History</h1>
          <p class="page-sub">All accessibility scans stored in this browser</p>
        </div>
        <button class="btn btn-secondary btn-sm" (click)="clearAll()" *ngIf="groups.length > 0" type="button">
          Clear All
        </button>
      </header>

      <!-- Empty state -->
      <div class="empty-state card" *ngIf="groups.length === 0">
        <div class="empty-icon" aria-hidden="true">📭</div>
        <h2>No scan history yet</h2>
        <p>Run your first scan to start tracking improvements over time.</p>
        <a routerLink="/" class="btn btn-primary mt-3">Start Scanning</a>
      </div>

      <!-- Grouped by URL -->
      <div class="url-group card" *ngFor="let group of groups">
        <div class="group-header">
          <div class="group-url-info">
            <a [href]="group.url" target="_blank" rel="noopener" class="group-url">{{ group.url }}</a>
            <span class="group-count">{{ group.entries.length }} scan{{ group.entries.length !== 1 ? 's' : '' }}</span>
          </div>
          <div class="group-trend" *ngIf="group.entries.length > 1">
            <span class="trend-arrow"
                  [class.up]="group.trend > 0"
                  [class.down]="group.trend < 0">
              {{ group.trend > 0 ? '↑ +' + group.trend : group.trend < 0 ? '↓ ' + group.trend : '→' }} pts
            </span>
            <span class="trend-label">since first scan</span>
          </div>
        </div>

        <div class="scan-table">
          <div class="table-head">
            <span>Date</span>
            <span>Score</span>
            <span>Grade</span>
            <span>Violations</span>
            <span>Passed</span>
            <span></span>
          </div>
          <a class="table-row" *ngFor="let e of group.entries; let i = index"
             [routerLink]="['/results', e.id]"
             [attr.aria-label]="'View scan from ' + (e.timestamp | date:'medium')">
            <span class="cell-date">{{ e.timestamp | date:'MMM d, yyyy h:mm a' }}
              <span class="badge-new" *ngIf="i === 0">Latest</span>
            </span>
            <span class="cell-score" [style.color]="gradeColor(e.grade)">{{ e.score }}<small>/100</small></span>
            <span class="cell-grade">
              <span class="grade-circle" [style.background]="gradeColor(e.grade)">{{ e.grade }}</span>
            </span>
            <span class="cell-violations" [class.bad]="e.violationCount > 0">{{ e.violationCount }}</span>
            <span class="cell-passed">{{ e.passCount }}</span>
            <span class="cell-action">
              <button class="btn btn-secondary btn-sm"
                (click)="deleteEntry($event, e.id, group)"
                type="button"
                [attr.aria-label]="'Delete scan from ' + (e.timestamp | date:'medium')">
                🗑
              </button>
            </span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .history-page { padding:2rem 1.5rem 4rem; }
    .page-header { display:flex; align-items:flex-start; gap:1rem; flex-wrap:wrap;
      margin-bottom:2rem; }
    .page-header h1 { font-size:1.75rem; margin-bottom:0.25rem; }
    .page-sub { color:var(--text-secondary); font-size:0.9rem; }
    .back-btn { align-self:center; }
    .page-header > div:nth-child(2) { flex:1; }
    .empty-state { text-align:center; padding:3rem; max-width:480px; margin:0 auto; }
    .empty-icon { font-size:3rem; margin-bottom:1rem; }
    .empty-state h2 { margin-bottom:0.5rem; }
    .empty-state p { color:var(--text-secondary); }
    .url-group { padding:1.25rem; margin-bottom:1.25rem; }
    .group-header { display:flex; align-items:center; justify-content:space-between;
      gap:1rem; flex-wrap:wrap; margin-bottom:1rem; padding-bottom:0.75rem;
      border-bottom:1px solid var(--border); }
    .group-url-info { display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap; min-width:0; }
    .group-url { font-weight:600; word-break:break-all; font-size:0.9rem; }
    .group-count { color:var(--text-muted); font-size:0.8rem; white-space:nowrap; }
    .group-trend { display:flex; align-items:center; gap:0.375rem; }
    .trend-arrow { font-weight:700; font-size:0.875rem; }
    .trend-arrow.up { color:var(--success); }
    .trend-arrow.down { color:var(--danger); }
    .trend-label { font-size:0.75rem; color:var(--text-muted); }
    .scan-table { display:flex; flex-direction:column; gap:0; }
    .table-head { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr 60px;
      gap:0.5rem; padding:0.5rem 0.75rem; font-size:0.75rem; font-weight:600;
      color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; }
    .table-row { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr 60px;
      gap:0.5rem; align-items:center; padding:0.625rem 0.75rem;
      text-decoration:none; color:inherit; border-radius:var(--radius);
      transition:background 0.1s; }
    .table-row:hover { background:var(--surface-2); }
    .cell-date { font-size:0.8rem; display:flex; align-items:center; gap:0.5rem; }
    .badge-new { background:var(--primary); color:white; font-size:0.65rem;
      padding:0.1rem 0.4rem; border-radius:100px; font-weight:600; }
    .cell-score { font-size:1rem; font-weight:700; }
    .cell-score small { font-size:0.65rem; color:var(--text-muted); font-weight:400; }
    .grade-circle { width:24px; height:24px; border-radius:50%; display:inline-flex;
      align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; color:white; }
    .cell-violations { font-size:0.875rem; font-weight:600; }
    .cell-violations.bad { color:var(--danger); }
    .cell-passed { font-size:0.875rem; color:var(--success); }
    .cell-action { text-align:right; }
    @media(max-width:640px){
      .table-head,.table-row{grid-template-columns:2fr 1fr 1fr;}
      .cell-passed,.cell-action,.cell-grade{display:none;}
    }
  `]
})
export class HistoryComponent implements OnInit {
  groups: { url: string; entries: ScanHistoryEntry[]; trend: number }[] = [];

  constructor(private scoreService: AccessibilityScoreService) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    const all = this.scoreService.getHistory();
    const urlMap = new Map<string, ScanHistoryEntry[]>();
    for (const e of all) {
      if (!urlMap.has(e.url)) urlMap.set(e.url, []);
      urlMap.get(e.url)!.push(e);
    }
    this.groups = [];
    urlMap.forEach((entries, url) => {
      const sorted = entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const trend = sorted.length > 1 ? sorted[0].score - sorted[sorted.length - 1].score : 0;
      this.groups.push({ url, entries: sorted, trend });
    });
    this.groups.sort((a, b) =>
      new Date(b.entries[0].timestamp).getTime() - new Date(a.entries[0].timestamp).getTime()
    );
  }

  gradeColor(grade: string): string {
    return grade === 'A' ? '#10b981' : grade === 'B' ? '#3b82f6' :
           grade === 'C' ? '#f59e0b' : grade === 'D' ? '#ef4444' : '#dc2626';
  }

  deleteEntry(event: Event, id: string, group: { url: string; entries: ScanHistoryEntry[]; trend: number }): void {
    event.preventDefault();
    event.stopPropagation();
    this.scoreService.deleteHistoryEntry(id);
    group.entries = group.entries.filter(e => e.id !== id);
    if (group.entries.length === 0) {
      this.groups = this.groups.filter(g => g.url !== group.url);
    }
  }

  clearAll(): void {
    if (confirm('Clear all scan history? This cannot be undone.')) {
      this.scoreService.clearHistory();
      this.groups = [];
    }
  }
}
