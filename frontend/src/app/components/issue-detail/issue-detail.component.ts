import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Violation, FixSuggestion } from '../../models/scan.models';
import { ScanService } from '../../services/scan.service';
import { SeverityBadgeComponent } from '../severity-badge/severity-badge.component';

@Component({
  selector: 'app-issue-detail',
  imports: [CommonModule, SeverityBadgeComponent],
  template: `
    <div class="detail-overlay" role="dialog" aria-modal="true" [attr.aria-labelledby]="'detail-title'" (click)="onOverlayClick($event)">
      <div class="detail-panel" tabindex="-1">
        <div class="detail-header">
          <div class="detail-title-row">
            <app-severity-badge [impact]="violation.impact"></app-severity-badge>
            <code class="rule-id">{{ violation.id }}</code>
          </div>
          <button class="close-btn" (click)="close.emit()" type="button" aria-label="Close issue detail">✕</button>
        </div>

        <div class="detail-body">
          <h2 id="detail-title" class="detail-issue-title">{{ violation.description }}</h2>

          <section class="detail-section" *ngIf="fix">
            <h3>Why it matters</h3>
            <p>{{ fix.whyItMatters }}</p>
          </section>

          <section class="detail-section" *ngIf="fix">
            <h3>Plain English explanation</h3>
            <p>{{ fix.explanation }}</p>
          </section>

          <section class="detail-section" *ngIf="!fix && !loadingFix">
            <h3>About this issue</h3>
            <p>{{ violation.help }}</p>
          </section>

          <div class="loading" *ngIf="loadingFix" role="status" aria-live="polite">
            <div class="spinner" aria-hidden="true"></div>
            <span>Loading fix suggestion...</span>
          </div>

          <section class="detail-section" *ngIf="(violation.nodes?.length ?? 0) > 0">
            <h3>Affected elements ({{ violation.nodes.length }})</h3>
            <div class="affected-list">
              <div class="affected-item" *ngFor="let node of violation.nodes; let i = index">
                <div class="affected-num">{{ i + 1 }}</div>
                <div class="affected-content">
                  <div class="code-block">{{ node.html }}</div>
                  <p class="failure-summary" *ngIf="node.failureSummary">{{ node.failureSummary }}</p>
                </div>
              </div>
            </div>
          </section>

          <section class="detail-section" *ngIf="fix">
            <h3>Suggested fix</h3>
            <div class="fix-disclaimer alert alert-warning" role="note">
              ⚠️ This is a suggested code pattern, not an automatic fix. Review and adapt it to your specific context. Always re-test after making changes.
            </div>
            <div class="code-comparison">
              <div class="code-panel">
                <div class="code-label code-label-before">Before (problematic)</div>
                <pre class="code-block">{{ fix.before }}</pre>
              </div>
              <div class="code-panel">
                <div class="code-label code-label-after">After (suggested)</div>
                <pre class="code-block">{{ fix.after }}</pre>
              </div>
            </div>
          </section>

          <section class="detail-section" *ngIf="fix">
            <h3>Standard reference</h3>
            <p>{{ fix.wcagReference }}</p>
            <a [href]="violation.helpUrl" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm mt-2">
              Full documentation ↗
            </a>
          </section>

          <section class="detail-section" *ngIf="fix?.verificationSteps?.length">
            <h3>How to verify the fix</h3>
            <ol class="steps-list">
              <li *ngFor="let step of fix!.verificationSteps">{{ step }}</li>
            </ol>
          </section>

          <section class="detail-section" *ngIf="fix?.manualSteps?.length">
            <h3>Manual remediation steps</h3>
            <ol class="steps-list">
              <li *ngFor="let step of fix!.manualSteps">{{ step }}</li>
            </ol>
          </section>

          <div class="detail-section" *ngIf="fixError">
            <div class="alert alert-info">
              ℹ️ No specific fix template is available for this rule. Refer to the
              <a [href]="violation.helpUrl" target="_blank" rel="noopener noreferrer">official documentation</a>
              for manual remediation guidance.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 200;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      overflow-y: auto;
    }
    .detail-panel {
      background: white;
      width: min(640px, 100vw);
      min-height: 100vh;
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
    }
    .detail-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      background: white;
      z-index: 1;
    }
    .detail-title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .rule-id {
      background: var(--surface-2);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--text-muted);
      padding: 0.25rem;
      border-radius: 4px;
      line-height: 1;
      flex-shrink: 0;
    }
    .close-btn:hover { color: var(--text); background: var(--surface-2); }
    .detail-body {
      padding: 1.5rem;
      flex: 1;
    }
    .detail-issue-title {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .detail-section {
      margin-bottom: 1.75rem;
    }
    .detail-section h3 {
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
    }
    .detail-section p {
      font-size: 0.9375rem;
      line-height: 1.7;
    }
    .affected-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .affected-item { display: flex; gap: 0.75rem; }
    .affected-num {
      width: 1.5rem;
      height: 1.5rem;
      background: var(--primary-light);
      color: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
    .affected-content { flex: 1; min-width: 0; }
    .failure-summary {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin-top: 0.5rem;
    }
    .fix-disclaimer { margin-bottom: 1rem; font-size: 0.875rem; }
    .code-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .code-label {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px 4px 0 0;
      display: inline-block;
      margin-bottom: -4px;
    }
    .code-label-before { background: #fef2f2; color: var(--danger); }
    .code-label-after  { background: #f0fdf4; color: var(--success); }
    .code-block { white-space: pre-wrap; word-break: break-all; border-radius: 0 var(--radius) var(--radius) var(--radius); }
    .steps-list { padding-left: 1.5rem; }
    .steps-list li { margin-bottom: 0.5rem; font-size: 0.9rem; line-height: 1.6; }
    .loading { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 0; color: var(--text-secondary); }
    @media (max-width: 600px) {
      .code-comparison { grid-template-columns: 1fr; }
      .detail-panel { width: 100vw; }
    }
  `]
})
export class IssueDetailComponent implements OnChanges {
  @Input() violation!: Violation;
  @Output() close = new EventEmitter<void>();

  fix: FixSuggestion | null = null;
  loadingFix = false;
  fixError = false;

  constructor(private scanService: ScanService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['violation'] && this.violation) {
      this.fix = null;
      this.fixError = false;
      this.loadingFix = true;
      this.scanService.getFixSuggestion(this.violation.id).subscribe({
        next: fix => { this.fix = fix; this.loadingFix = false; },
        error: () => { this.fixError = true; this.loadingFix = false; }
      });
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('detail-overlay')) {
      this.close.emit();
    }
  }
}
