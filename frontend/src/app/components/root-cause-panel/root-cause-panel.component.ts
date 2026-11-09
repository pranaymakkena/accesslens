import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RootCauseComponent, AriaHiddenCascade, WcagGraphCriteria } from '../../models/scan.models';

@Component({
  selector: 'app-root-cause-panel',
  imports: [CommonModule],
  template: `
    <!-- Root Cause Components -->
    <div class="panel card" *ngIf="rootCauses?.length" role="region" aria-labelledby="rc-heading">
      <div class="panel-header">
        <span class="panel-icon" aria-hidden="true">🎯</span>
        <div>
          <h3 id="rc-heading" class="panel-title">Cascading Impact Analysis</h3>
          <p class="panel-sub">
            Neo4j graph traversal found these ancestor components whose subtrees
            contain multiple violation types. Fixing them resolves issues for all
            their descendants at once.
          </p>
        </div>
      </div>

      <div class="rc-list" role="list">
        <div class="rc-item" *ngFor="let rc of rootCauses; let i = index" role="listitem">
          <div class="rc-rank" [class]="'rank-' + (i + 1)" aria-label="Rank {{ i + 1 }}">{{ i + 1 }}</div>
          <div class="rc-body">
            <div class="rc-top">
              <code class="rc-selector">{{ rc.selector }}</code>
              <span class="rc-tag-count">
                {{ rc.distinctRules }} rule types · {{ rc.totalViolations }} total violations
              </span>
            </div>
            <div class="rc-rules">
              <code class="rule-chip" *ngFor="let r of rc.affectedRules">{{ r }}</code>
            </div>
            <div class="rc-severity-dots">
              <span class="sev-dot" *ngFor="let s of uniqueSeverities(rc.severities)"
                    [class]="'sev-' + s" [attr.aria-label]="'Includes ' + s + ' violations'">
                {{ s }}
              </span>
            </div>
          </div>
          <div class="rc-impact-badge">
            <span class="impact-score">{{ rc.totalViolations }}</span>
            <span class="impact-label">violations cascade</span>
          </div>
        </div>
      </div>
    </div>

    <!-- aria-hidden Cascade Warnings -->
    <div class="panel card aria-panel" *ngIf="ariaHiddenCascades?.length" role="region" aria-labelledby="aria-heading">
      <div class="panel-header">
        <span class="panel-icon" aria-hidden="true">👻</span>
        <div>
          <h3 id="aria-heading" class="panel-title">aria-hidden Cascade Detected</h3>
          <p class="panel-sub">
            These elements have <code>aria-hidden="true"</code> set, which hides
            all their descendants from screen readers — even interactive elements
            that remain keyboard-focusable.
          </p>
        </div>
      </div>
      <div class="aria-list" role="list">
        <div class="aria-item" *ngFor="let c of ariaHiddenCascades" role="listitem">
          <div class="aria-ancestor">
            <span class="ghost-icon" aria-hidden="true">👻</span>
            <code>{{ c.hiddenAncestor }}</code>
          </div>
          <p class="aria-desc">
            Hides <strong>{{ c.blockedCount }}</strong> descendant
            element{{ c.blockedCount !== 1 ? 's' : '' }} from the accessibility tree.
          </p>
          <div class="aria-descendants" *ngIf="c.blockedDescendants?.length">
            <code class="desc-chip" *ngFor="let d of c.blockedDescendants.slice(0, 5)">{{ d }}</code>
            <span *ngIf="c.blockedDescendants.length > 5" class="more-chip">
              +{{ c.blockedDescendants.length - 5 }} more
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Graph-powered WCAG Roadmap -->
    <div class="panel card wcag-panel" *ngIf="wcagRoadmap?.length" role="region" aria-labelledby="wcag-road-heading">
      <div class="panel-header">
        <span class="panel-icon" aria-hidden="true">📐</span>
        <div>
          <h3 id="wcag-road-heading" class="panel-title">WCAG Specification Roadmap</h3>
          <p class="panel-sub">
            Live violations linked directly to the W3C WCAG 2.1 specification graph.
            Each criterion shows which axe-core rules map to it.
          </p>
        </div>
      </div>
      <div class="wcag-list" role="list">
        <a class="wcag-item" *ngFor="let w of wcagRoadmap" [href]="w.url" target="_blank"
           rel="noopener noreferrer" role="listitem"
           [attr.aria-label]="'WCAG ' + w.criteriaId + ' ' + w.name + ': ' + w.violationCount + ' violations'">
          <div class="wcag-id-block">
            <span class="wcag-id">{{ w.criteriaId }}</span>
            <span class="wcag-level" [class]="'lvl-' + w.level.toLowerCase()">{{ w.level }}</span>
          </div>
          <div class="wcag-info">
            <span class="wcag-name">{{ w.name }}</span>
            <span class="wcag-principle">{{ w.principle }} · {{ w.guideline }}</span>
            <div class="wcag-rules">
              <code class="wc-chip" *ngFor="let r of w.ruleIds">{{ r }}</code>
            </div>
          </div>
          <div class="wcag-count">
            <span class="wc-num">{{ w.violationCount }}</span>
            <span class="wc-label">violation{{ w.violationCount !== 1 ? 's' : '' }}</span>
          </div>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .panel { padding:1.5rem; margin-bottom:1.5rem; }
    .panel-header { display:flex; gap:0.875rem; align-items:flex-start; margin-bottom:1.25rem; }
    .panel-icon { font-size:1.5rem; flex-shrink:0; margin-top:0.1rem; }
    .panel-title { font-size:1rem; font-weight:600; margin-bottom:0.25rem; }
    .panel-sub { font-size:0.8rem; color:var(--text-secondary); line-height:1.5; }
    /* Root causes */
    .rc-list { display:flex; flex-direction:column; gap:0.75rem; }
    .rc-item { display:flex; align-items:flex-start; gap:0.875rem; padding:0.875rem;
      border:1px solid var(--border); border-radius:var(--radius); background:var(--surface); }
    .rc-rank { width:28px; height:28px; border-radius:50%; display:flex; align-items:center;
      justify-content:center; font-size:0.8rem; font-weight:700; color:white; flex-shrink:0; }
    .rank-1{background:#dc2626;}.rank-2{background:#ea580c;}.rank-3{background:#d97706;}
    .rank-4{background:#3b82f6;}.rank-5{background:#6366f1;}
    .rc-body { flex:1; min-width:0; }
    .rc-top { display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.375rem; }
    .rc-selector { font-size:0.75rem; background:var(--surface-2); padding:0.1rem 0.4rem;
      border-radius:3px; word-break:break-all; max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .rc-tag-count { font-size:0.75rem; color:var(--text-muted); white-space:nowrap; }
    .rc-rules,.rc-severity-dots { display:flex; flex-wrap:wrap; gap:0.25rem; margin-top:0.25rem; }
    .rule-chip { background:#fef2f2; color:#dc2626; border:1px solid #fecaca;
      font-size:0.7rem; padding:0.1rem 0.4rem; border-radius:3px; }
    .sev-dot { font-size:0.65rem; padding:0.1rem 0.4rem; border-radius:100px; font-weight:600; }
    .sev-critical{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;}
    .sev-serious{background:#fff7ed;color:#ea580c;border:1px solid #fed7aa;}
    .sev-moderate{background:#fffbeb;color:#d97706;border:1px solid #fde68a;}
    .sev-minor{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;}
    .rc-impact-badge { display:flex; flex-direction:column; align-items:center; flex-shrink:0; }
    .impact-score { font-size:1.5rem; font-weight:700; color:var(--danger); }
    .impact-label { font-size:0.65rem; color:var(--text-muted); text-align:center; }
    /* aria-hidden */
    .aria-panel { border-left:4px solid #7c3aed; }
    .aria-list { display:flex; flex-direction:column; gap:0.75rem; }
    .aria-item { padding:0.875rem; background:#faf5ff; border:1px solid #e9d5ff; border-radius:var(--radius); }
    .aria-ancestor { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.375rem; }
    .ghost-icon { font-size:1.1rem; }
    .aria-ancestor code { font-size:0.8rem; word-break:break-all; }
    .aria-desc { font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.375rem; }
    .aria-descendants { display:flex; flex-wrap:wrap; gap:0.25rem; }
    .desc-chip { background:white; border:1px solid #e9d5ff; color:#7c3aed;
      font-size:0.7rem; padding:0.1rem 0.4rem; border-radius:3px; }
    .more-chip { font-size:0.7rem; color:var(--text-muted); align-self:center; }
    /* WCAG roadmap */
    .wcag-list { display:flex; flex-direction:column; gap:0.5rem; }
    .wcag-item { display:flex; align-items:flex-start; gap:0.875rem; padding:0.75rem;
      border:1px solid var(--border); border-radius:var(--radius); background:var(--surface);
      text-decoration:none; color:inherit; transition:background 0.1s; }
    .wcag-item:hover { background:var(--surface-2); }
    .wcag-id-block { display:flex; flex-direction:column; align-items:center; gap:0.25rem; flex-shrink:0; min-width:48px; }
    .wcag-id { font-size:1rem; font-weight:700; color:var(--primary); }
    .wcag-level { font-size:0.65rem; padding:0.1rem 0.4rem; border-radius:100px; font-weight:600; }
    .lvl-a{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;}
    .lvl-aa{background:#fffbeb;color:#d97706;border:1px solid #fde68a;}
    .lvl-aaa{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;}
    .wcag-info { flex:1; min-width:0; }
    .wcag-name { display:block; font-size:0.875rem; font-weight:600; margin-bottom:0.1rem; }
    .wcag-principle { display:block; font-size:0.75rem; color:var(--text-muted); margin-bottom:0.25rem; }
    .wcag-rules { display:flex; flex-wrap:wrap; gap:0.2rem; }
    .wc-chip { background:var(--surface-2); font-size:0.7rem; padding:0.1rem 0.35rem;
      border-radius:3px; color:var(--text-secondary); border:1px solid var(--border); }
    .wcag-count { display:flex; flex-direction:column; align-items:center; flex-shrink:0; }
    .wc-num { font-size:1.25rem; font-weight:700; color:var(--danger); }
    .wc-label { font-size:0.65rem; color:var(--text-muted); }
  `]
})
export class RootCausePanelComponent {
  @Input() rootCauses: RootCauseComponent[] = [];
  @Input() ariaHiddenCascades: AriaHiddenCascade[] = [];
  @Input() wcagRoadmap: WcagGraphCriteria[] = [];

  uniqueSeverities(severities: string[]): string[] {
    const order = ['critical', 'serious', 'moderate', 'minor'];
    return order.filter(s => severities?.includes(s));
  }
}
