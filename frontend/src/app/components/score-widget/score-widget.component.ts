import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessibilityScore, WcagPrincipleBreakdown } from '../../models/scan.models';

@Component({
  selector: 'app-score-widget',
  imports: [CommonModule],
  template: `
    <div class="score-widget card" role="region" aria-label="Accessibility score summary">
      <div class="score-ring-wrap" [attr.aria-label]="'Score: ' + score.score + '/100, grade ' + score.grade">
        <svg class="score-ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle class="ring-bg" cx="60" cy="60" r="52" />
          <circle class="ring-progress" cx="60" cy="60" r="52"
            [style.stroke]="score.gradeColor"
            [style.stroke-dashoffset]="dashOffset" />
        </svg>
        <div class="score-inner">
          <span class="score-number" [style.color]="score.gradeColor">{{ score.score }}</span>
          <span class="score-grade" [style.color]="score.gradeColor">{{ score.grade }}</span>
        </div>
      </div>
      <div class="score-details">
        <h3 class="score-title">Accessibility Score</h3>
        <p class="score-subtitle">{{ scoreLabel }}</p>
        <div class="breakdown-list" aria-label="Issue severity breakdown">
          <div class="breakdown-row" *ngFor="let item of breakdownItems">
            <span class="breakdown-dot" [style.background]="item.color" aria-hidden="true"></span>
            <span class="breakdown-label">{{ item.label }}</span>
            <span class="breakdown-bar-wrap" aria-hidden="true">
              <span class="breakdown-bar" [style.width.%]="item.pct" [style.background]="item.color"></span>
            </span>
            <span class="breakdown-count">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .score-widget { display:flex; align-items:center; gap:2rem; padding:1.5rem; }
    .score-ring-wrap { position:relative; width:120px; height:120px; flex-shrink:0; }
    .score-ring { width:100%; height:100%; transform:rotate(-90deg); }
    .ring-bg { fill:none; stroke:var(--border); stroke-width:8; }
    .ring-progress { fill:none; stroke-width:8; stroke-linecap:round;
      stroke-dasharray:326.7; transition:stroke-dashoffset 1s ease; }
    .score-inner { position:absolute; inset:0; display:flex; flex-direction:column;
      align-items:center; justify-content:center; }
    .score-number { font-size:2rem; font-weight:700; line-height:1; }
    .score-grade { font-size:1rem; font-weight:700; line-height:1; margin-top:2px; }
    .score-details { flex:1; min-width:0; }
    .score-title { font-size:1rem; font-weight:600; margin-bottom:0.25rem; }
    .score-subtitle { font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.75rem; }
    .breakdown-list { display:flex; flex-direction:column; gap:0.375rem; }
    .breakdown-row { display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; }
    .breakdown-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .breakdown-label { width:4.5rem; flex-shrink:0; color:var(--text-secondary); }
    .breakdown-bar-wrap { flex:1; background:var(--surface-2); border-radius:4px; height:6px; overflow:hidden; }
    .breakdown-bar { display:block; height:6px; border-radius:4px; transition:width 0.6s ease; min-width:2px; }
    .breakdown-count { width:1.5rem; text-align:right; font-weight:600; color:var(--text); }
    @media(max-width:480px){
      .score-widget{flex-direction:column;align-items:flex-start;gap:1rem;}
    }
  `]
})
export class ScoreWidgetComponent implements OnChanges {
  @Input() score!: AccessibilityScore;
  @Input() wcagBreakdown: WcagPrincipleBreakdown[] = [];

  dashOffset = 326.7;
  breakdownItems: { label: string; count: number; color: string; pct: number }[] = [];

  get scoreLabel(): string {
    const s = this.score?.score ?? 0;
    if (s >= 90) return 'Excellent accessibility';
    if (s >= 75) return 'Good, minor improvements needed';
    if (s >= 60) return 'Fair, several issues to address';
    if (s >= 40) return 'Poor, significant work required';
    return 'Critical — major accessibility barriers';
  }

  ngOnChanges(): void {
    if (!this.score) return;
    const circumference = 326.7;
    this.dashOffset = circumference - (this.score.score / 100) * circumference;
    const max = Math.max(
      this.score.breakdown.critical, this.score.breakdown.serious,
      this.score.breakdown.moderate, this.score.breakdown.minor, 1
    );
    this.breakdownItems = [
      { label: 'Critical', count: this.score.breakdown.critical, color: '#dc2626', pct: (this.score.breakdown.critical/max)*100 },
      { label: 'Serious',  count: this.score.breakdown.serious,  color: '#ea580c', pct: (this.score.breakdown.serious/max)*100  },
      { label: 'Moderate', count: this.score.breakdown.moderate, color: '#d97706', pct: (this.score.breakdown.moderate/max)*100 },
      { label: 'Minor',    count: this.score.breakdown.minor,    color: '#65a30d', pct: (this.score.breakdown.minor/max)*100    },
    ];
  }

  pctColor(pct: number): string {
    if (pct >= 80) return '#10b981';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
  }
}
