import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WcagPrincipleBreakdown } from '../../models/scan.models';

@Component({
  selector: 'app-wcag-breakdown',
  imports: [CommonModule],
  template: `
    <div class="wcag-card card" role="region" aria-label="WCAG 2.1 principle breakdown">
      <h3 class="wcag-title">WCAG 2.1 Principle Coverage</h3>
      <p class="wcag-subtitle">How well the page satisfies each accessibility principle</p>
      <div class="principles-grid">
        <div class="principle-item" *ngFor="let p of breakdown">
          <div class="principle-top">
            <span class="principle-icon" aria-hidden="true">{{ p.icon }}</span>
            <div class="principle-info">
              <span class="principle-label">{{ p.label }}</span>
              <span class="principle-counts">{{ p.passed }} / {{ p.total }} checks passed</span>
            </div>
            <span class="principle-pct" [style.color]="pctColor(p.pct)">{{ p.pct }}%</span>
          </div>
          <div class="principle-bar-track"
               role="progressbar"
               [attr.aria-valuenow]="p.pct"
               aria-valuemin="0" aria-valuemax="100"
               [attr.aria-label]="p.label + ': ' + p.pct + '% passing'">
            <div class="principle-bar-fill"
                 [style.width.%]="p.pct"
                 [style.background]="pctColor(p.pct)"></div>
          </div>
          <div class="principle-chips" *ngIf="p.failed > 0">
            <span class="fail-chip">{{ p.failed }} failing</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wcag-card { padding:1.5rem; }
    .wcag-title { font-size:1rem; font-weight:600; margin-bottom:0.25rem; }
    .wcag-subtitle { font-size:0.8rem; color:var(--text-secondary); margin-bottom:1.25rem; }
    .principles-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
    .principle-item { display:flex; flex-direction:column; gap:0.5rem; }
    .principle-top { display:flex; align-items:center; gap:0.5rem; }
    .principle-icon { font-size:1.25rem; flex-shrink:0; }
    .principle-info { flex:1; min-width:0; }
    .principle-label { display:block; font-size:0.875rem; font-weight:600; }
    .principle-counts { display:block; font-size:0.75rem; color:var(--text-muted); }
    .principle-pct { font-size:1rem; font-weight:700; flex-shrink:0; }
    .principle-bar-track { background:var(--surface-2); border-radius:6px; height:8px; overflow:hidden; }
    .principle-bar-fill { height:8px; border-radius:6px; transition:width 0.8s ease; min-width:4px; }
    .principle-chips { display:flex; gap:0.375rem; flex-wrap:wrap; }
    .fail-chip { background:#fef2f2; color:#dc2626; border:1px solid #fecaca;
      font-size:0.7rem; padding:0.1rem 0.5rem; border-radius:100px; font-weight:500; }
    @media(max-width:600px){ .principles-grid { grid-template-columns:1fr; } }
  `]
})
export class WcagBreakdownComponent {
  @Input() breakdown: WcagPrincipleBreakdown[] = [];

  pctColor(pct: number): string {
    if (pct >= 80) return '#10b981';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
  }
}
