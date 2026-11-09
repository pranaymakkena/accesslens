import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccessibilityScoreService } from '../../services/accessibility-score.service';
import { ScanHistoryEntry } from '../../models/scan.models';

@Component({
  selector: 'app-scan-history',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="history-card card" role="region" aria-labelledby="history-heading" *ngIf="entries.length > 0">
      <div class="history-header">
        <h3 id="history-heading" class="history-title">📈 Scan History for This URL</h3>
        <button class="btn btn-secondary btn-sm" (click)="confirmClear()" type="button"
                aria-label="Clear scan history for this URL">
          Clear
        </button>
      </div>
      <p class="history-sub">Track your accessibility improvements over time</p>

      <!-- Trend line (sparkline) -->
      <div class="sparkline-wrap" aria-hidden="true" *ngIf="entries.length > 1">
        <svg [attr.viewBox]="'0 0 ' + sparkW + ' ' + sparkH" class="sparkline">
          <polyline [attr.points]="sparkPoints" class="spark-line"/>
          <circle *ngFor="let pt of sparkDots"
            [attr.cx]="pt.x" [attr.cy]="pt.y" r="3" class="spark-dot"
            [class.spark-dot-latest]="pt.latest"/>
        </svg>
        <div class="spark-labels">
          <span>{{ entries[entries.length - 1].timestamp | date:'MMM d' }}</span>
          <span>{{ entries[0].timestamp | date:'MMM d' }}</span>
        </div>
      </div>

      <div class="trend-summary" *ngIf="entries.length > 1">
        <span class="trend-badge" [class.trend-up]="trend > 0" [class.trend-down]="trend < 0" [class.trend-flat]="trend === 0">
          {{ trend > 0 ? '↑ +' + trend : trend < 0 ? '↓ ' + trend : '→ No change' }} pts since last scan
        </span>
      </div>

      <div class="history-list" role="list">
        <a class="history-row" *ngFor="let e of entries; let i = index"
           [routerLink]="['/results', e.id]"
           role="listitem"
           [attr.aria-label]="'Scan from ' + (e.timestamp | date:'medium') + ', score ' + e.score">
          <span class="history-date">{{ e.timestamp | date:'MMM d, h:mm a' }}</span>
          <span class="history-score" [style.color]="gradeColor(e.grade)">
            {{ e.score }}<small>/100</small>
          </span>
          <span class="history-grade grade-badge" [style.background]="gradeColor(e.grade)">{{ e.grade }}</span>
          <span class="history-violations">{{ e.violationCount }} violation{{ e.violationCount !== 1 ? 's' : '' }}</span>
          <span class="history-current-badge" *ngIf="i === 0">Latest</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .history-card { padding:1.5rem; }
    .history-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.25rem; }
    .history-title { font-size:1rem; font-weight:600; }
    .history-sub { font-size:0.8rem; color:var(--text-secondary); margin-bottom:1rem; }
    .sparkline-wrap { margin-bottom:0.5rem; }
    .sparkline { width:100%; height:48px; display:block; }
    .spark-line { fill:none; stroke:var(--primary); stroke-width:2; stroke-linejoin:round; }
    .spark-dot { fill:var(--primary); }
    .spark-dot-latest { fill:var(--success); r:4; }
    .spark-labels { display:flex; justify-content:space-between; font-size:0.7rem; color:var(--text-muted); }
    .trend-summary { margin-bottom:0.75rem; }
    .trend-badge { font-size:0.8rem; padding:0.2rem 0.6rem; border-radius:100px; font-weight:600; }
    .trend-up { background:#f0fdf4; color:#16a34a; }
    .trend-down { background:#fef2f2; color:#dc2626; }
    .trend-flat { background:var(--surface-2); color:var(--text-secondary); }
    .history-list { display:flex; flex-direction:column; gap:0.375rem; }
    .history-row { display:flex; align-items:center; gap:0.75rem; padding:0.5rem 0.75rem;
      border-radius:var(--radius); text-decoration:none; color:inherit;
      border:1px solid var(--border); transition:background 0.1s; }
    .history-row:hover { background:var(--surface-2); }
    .history-date { flex:1; font-size:0.8rem; color:var(--text-secondary); }
    .history-score { font-size:1rem; font-weight:700; }
    .history-score small { font-size:0.7rem; font-weight:400; color:var(--text-muted); }
    .grade-badge { width:24px; height:24px; border-radius:50%; display:flex;
      align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; color:white; }
    .history-violations { font-size:0.8rem; color:var(--text-muted); }
    .history-current-badge { background:var(--primary); color:white; font-size:0.7rem;
      padding:0.1rem 0.5rem; border-radius:100px; font-weight:600; }
  `]
})
export class ScanHistoryComponent implements OnInit {
  @Input() currentUrl = '';
  @Input() currentId = '';
  @Output() cleared = new EventEmitter<void>();

  entries: ScanHistoryEntry[] = [];
  trend = 0;
  sparkW = 200;
  sparkH = 48;
  sparkPoints = '';
  sparkDots: { x: number; y: number; latest: boolean }[] = [];

  constructor(private scoreService: AccessibilityScoreService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.entries = this.scoreService.getHistoryForUrl(this.currentUrl)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    if (this.entries.length >= 2) {
      this.trend = this.entries[0].score - this.entries[1].score;
    }
    this.buildSparkline();
  }

  buildSparkline(): void {
    if (this.entries.length < 2) return;
    const reversed = [...this.entries].reverse();
    const scores = reversed.map(e => e.score);
    const minS = Math.min(...scores);
    const maxS = Math.max(...scores, minS + 1);
    const pts = reversed.map((e, i) => {
      const x = (i / (reversed.length - 1)) * this.sparkW;
      const y = this.sparkH - ((e.score - minS) / (maxS - minS)) * (this.sparkH - 8) - 4;
      return { x, y, latest: i === reversed.length - 1 };
    });
    this.sparkPoints = pts.map(p => `${p.x},${p.y}`).join(' ');
    this.sparkDots = pts;
  }

  gradeColor(grade: string): string {
    return grade === 'A' ? '#10b981' : grade === 'B' ? '#3b82f6' :
           grade === 'C' ? '#f59e0b' : grade === 'D' ? '#ef4444' : '#dc2626';
  }

  confirmClear(): void {
    if (confirm('Clear scan history for this URL?')) {
      this.entries.forEach(e => this.scoreService.deleteHistoryEntry(e.id));
      this.entries = [];
      this.cleared.emit();
    }
  }
}
