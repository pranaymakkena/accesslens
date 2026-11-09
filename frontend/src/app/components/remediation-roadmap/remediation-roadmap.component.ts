import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemediationItem, Violation } from '../../models/scan.models';

@Component({
  selector: 'app-remediation-roadmap',
  imports: [CommonModule],
  template: `
    <div class="roadmap-card card" role="region" aria-labelledby="roadmap-heading">
      <div class="roadmap-header">
        <div>
          <h3 id="roadmap-heading" class="roadmap-title">🗺️ Smart Fix Roadmap</h3>
          <p class="roadmap-sub">Ranked by impact-to-effort ratio — fix these first for the biggest accessibility gains</p>
        </div>
      </div>
      <div class="roadmap-list" role="list">
        <div class="roadmap-item" *ngFor="let item of items" role="listitem">
          <div class="rank-badge" [class]="'rank-' + item.rank" aria-label="Priority {{ item.rank }}">
            {{ item.rank }}
          </div>
          <div class="roadmap-content">
            <div class="roadmap-top">
              <span class="roadmap-rule">{{ item.violation.id }}</span>
              <span class="impact-tag" [class]="'impact-' + item.estimatedImpact">
                {{ item.estimatedImpact }} impact
              </span>
              <span class="effort-tag" [class]="'effort-' + item.effort">
                {{ item.effortLabel }}
              </span>
            </div>
            <p class="roadmap-desc">{{ item.violation.description }}</p>
            <div class="roadmap-meta">
              <span class="meta-item">👥 {{ item.affectedUsers }}</span>
              <span class="meta-item">📌 {{ item.violation.nodeCount || 1 }} element{{ (item.violation.nodeCount || 1) !== 1 ? 's' : '' }} affected</span>
            </div>
          </div>
          <button class="view-fix-btn btn btn-outline btn-sm"
                  (click)="viewFix.emit(item.violation)"
                  type="button"
                  [attr.aria-label]="'View fix for ' + item.violation.id">
            View Fix
          </button>
        </div>
      </div>
      <p class="roadmap-note" *ngIf="!items.length">
        ✅ No violations to prioritise — great job!
      </p>
    </div>
  `,
  styles: [`
    .roadmap-card { padding:1.5rem; }
    .roadmap-header { margin-bottom:1.25rem; }
    .roadmap-title { font-size:1rem; font-weight:600; margin-bottom:0.25rem; }
    .roadmap-sub { font-size:0.8rem; color:var(--text-secondary); }
    .roadmap-list { display:flex; flex-direction:column; gap:0.875rem; }
    .roadmap-item { display:flex; align-items:flex-start; gap:0.875rem;
      padding:0.875rem; border:1px solid var(--border); border-radius:var(--radius);
      background:var(--surface); transition:box-shadow 0.15s; }
    .roadmap-item:hover { box-shadow:var(--shadow); }
    .rank-badge { width:28px; height:28px; border-radius:50%; display:flex;
      align-items:center; justify-content:center; font-size:0.8rem; font-weight:700;
      flex-shrink:0; color:white; }
    .rank-1 { background:#dc2626; }
    .rank-2 { background:#ea580c; }
    .rank-3 { background:#d97706; }
    .rank-4 { background:#3b82f6; }
    .rank-5 { background:#6366f1; }
    .roadmap-content { flex:1; min-width:0; }
    .roadmap-top { display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.25rem; }
    .roadmap-rule { font-size:0.8rem; font-family:'JetBrains Mono',monospace;
      background:var(--surface-2); padding:0.1rem 0.4rem; border-radius:4px; }
    .impact-tag,.effort-tag { font-size:0.7rem; padding:0.15rem 0.5rem; border-radius:100px; font-weight:500; }
    .impact-high { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
    .impact-medium { background:#fffbeb; color:#d97706; border:1px solid #fde68a; }
    .impact-low { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }
    .effort-easy { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }
    .effort-medium { background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; }
    .effort-hard { background:#faf5ff; color:#7c3aed; border:1px solid #e9d5ff; }
    .roadmap-desc { font-size:0.875rem; color:var(--text); margin-bottom:0.375rem; }
    .roadmap-meta { display:flex; gap:1rem; flex-wrap:wrap; }
    .meta-item { font-size:0.775rem; color:var(--text-muted); }
    .view-fix-btn { flex-shrink:0; align-self:center; white-space:nowrap; }
    .roadmap-note { text-align:center; color:var(--text-secondary); font-size:0.9rem; padding:1rem 0; }
    @media(max-width:560px){ .view-fix-btn{display:none;} }
  `]
})
export class RemediationRoadmapComponent {
  @Input() items: RemediationItem[] = [];
  @Output() viewFix = new EventEmitter<Violation>();
}
