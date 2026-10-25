import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScanService } from '../../services/scan.service';
import { ScanResult, Violation } from '../../models/scan.models';
import { IssueCardComponent } from '../../components/issue-card/issue-card.component';
import { IssueDetailComponent } from '../../components/issue-detail/issue-detail.component';
import { SeverityBadgeComponent } from '../../components/severity-badge/severity-badge.component';

@Component({
  selector: 'app-demo',
  imports: [CommonModule, RouterLink, IssueCardComponent, IssueDetailComponent, SeverityBadgeComponent],
  template: `
    <div class="demo-page">
      <div class="container">
        <div class="demo-header">
          <a routerLink="/" class="btn btn-secondary btn-sm">← Back to Scanner</a>
          <div class="demo-badge">📋 Built-in Demo</div>
        </div>

        <div class="demo-intro card">
          <h1>Before &amp; After Demo</h1>
          <p>
            This demo uses a <strong>controlled sample page</strong> with intentionally introduced accessibility issues.
            It shows what AccessLens detects, what each issue means, and what a suggested fix looks like.
          </p>
          <p>
            The "Before" view shows the original broken page. The "After" view shows the page with suggested corrections applied.
            <strong>Note:</strong> The "After" state represents changes to a controlled example only —
            AccessLens never modifies any external website.
          </p>
        </div>

        <div class="loading-state" *ngIf="loading" role="status" aria-live="polite">
          <div class="spinner" aria-hidden="true"></div>
          <span>Loading demo data...</span>
        </div>

        <div class="alert alert-error" role="alert" *ngIf="error">
          <span aria-hidden="true">❌</span>
          <span>{{ error }}</span>
        </div>

        <div class="demo-content" *ngIf="result && !loading">
          <div class="before-after-tabs" role="tablist" aria-label="Before and after comparison">
            <button
              role="tab"
              [attr.aria-selected]="activeTab === 'before'"
              [class.active]="activeTab === 'before'"
              (click)="activeTab = 'before'"
              type="button">
              ❌ Before ({{ result.violationCount }} violations)
            </button>
            <button
              role="tab"
              [attr.aria-selected]="activeTab === 'after'"
              [class.active]="activeTab === 'after'"
              (click)="activeTab = 'after'"
              type="button">
              ✅ After (suggested fixes applied)
            </button>
            <button
              role="tab"
              [attr.aria-selected]="activeTab === 'html'"
              [class.active]="activeTab === 'html'"
              (click)="activeTab = 'html'"
              type="button">
              &lt;/&gt; Sample HTML
            </button>
          </div>

          <!-- Before tab -->
          <div role="tabpanel" *ngIf="activeTab === 'before'">
            <div class="summary-row">
              <div class="summary-stat stat-danger">
                <span class="stat-value">{{ result.violationCount }}</span>
                <span class="stat-label">Violations found</span>
              </div>
              <div class="summary-stat stat-success">
                <span class="stat-value">{{ result.passCount }}</span>
                <span class="stat-label">Checks passed</span>
              </div>
              <div class="summary-stat stat-warning" *ngIf="result.incompleteCount">
                <span class="stat-value">{{ result.incompleteCount }}</span>
                <span class="stat-label">Needs review</span>
              </div>
            </div>

            <p class="tab-desc">These violations were detected on the controlled sample page with intentional accessibility issues:</p>
            <div class="issues-list">
              <app-issue-card
                *ngFor="let v of result.violations"
                [violation]="v"
                (viewDetails)="openDetail($event)">
              </app-issue-card>
            </div>
          </div>

          <!-- After tab -->
          <div role="tabpanel" *ngIf="activeTab === 'after'">
            <div class="after-header card after-success">
              <div class="after-icon" aria-hidden="true">✅</div>
              <div>
                <h2>After applying suggested fixes</h2>
                <p>
                  The violations shown in the "Before" tab are addressed by the following changes.
                  This is what the corrected page <em>would</em> look like if the suggestions were applied.
                </p>
                <p class="caveat">
                  <strong>Important:</strong> These are suggested corrections to the controlled example only.
                  AccessLens does not scan the corrected version automatically in this prototype.
                  In production use, re-scan after making changes to verify improvements.
                </p>
              </div>
            </div>

            <div class="fix-list">
              <div class="fix-entry card" *ngFor="let fix of demoFixes">
                <div class="fix-header-row">
                  <app-severity-badge [impact]="fix.impact"></app-severity-badge>
                  <code class="rule-id">{{ fix.ruleId }}</code>
                  <span class="fix-title">{{ fix.issue }}</span>
                </div>
                <div class="code-comparison">
                  <div class="code-panel">
                    <div class="code-label code-label-before">Before</div>
                    <pre class="code-block">{{ fix.before }}</pre>
                  </div>
                  <div class="code-panel">
                    <div class="code-label code-label-after">After</div>
                    <pre class="code-block">{{ fix.after }}</pre>
                  </div>
                </div>
                <p class="fix-explanation">{{ fix.explanation }}</p>
              </div>
            </div>
          </div>

          <!-- HTML tab -->
          <div role="tabpanel" *ngIf="activeTab === 'html'">
            <p class="tab-desc">This is the sample HTML used to generate the demo results. It contains intentional accessibility issues.</p>
            <pre class="code-block html-block">{{ sampleHtml }}</pre>
            <div class="alert alert-info" role="note">
              ℹ️ This page is served locally by the AccessLens backend. It is never publicly accessible and is used only for demonstration purposes.
            </div>
          </div>
        </div>

        <div class="demo-cta card" *ngIf="!loading">
          <h2>Ready to scan your own website?</h2>
          <p>Enter any public URL to detect real accessibility issues.</p>
          <a routerLink="/" class="btn btn-primary btn-lg">Start a Real Scan →</a>
        </div>
      </div>
    </div>

    <!-- Issue detail panel -->
    <app-issue-detail
      *ngIf="selectedViolation"
      [violation]="selectedViolation"
      (close)="closeDetail()">
    </app-issue-detail>
  `,
  styles: [`
    .demo-page { padding: 2rem 0 4rem; }
    .demo-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .demo-badge {
      background: var(--primary-light);
      color: var(--primary);
      padding: 0.25rem 0.875rem;
      border-radius: 100px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .demo-intro {
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .demo-intro h1 { font-size: 1.75rem; margin-bottom: 0.875rem; }
    .demo-intro p { color: var(--text-secondary); line-height: 1.7; margin-bottom: 0.5rem; }
    .loading-state {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 3rem;
      justify-content: center;
      color: var(--text-secondary);
    }

    .before-after-tabs {
      display: flex;
      border-bottom: 2px solid var(--border);
      margin-bottom: 1.5rem;
      gap: 0.25rem;
    }
    .before-after-tabs button {
      background: none;
      border: none;
      padding: 0.75rem 1.25rem;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      color: var(--text-secondary);
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      border-radius: var(--radius) var(--radius) 0 0;
      transition: all 0.15s;
    }
    .before-after-tabs button:hover { color: var(--text); background: var(--surface-2); }
    .before-after-tabs button.active { color: var(--primary); border-bottom-color: var(--primary); }

    .summary-row {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .summary-stat { display: flex; flex-direction: column; }
    .stat-value { font-size: 2rem; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.25rem; }
    .stat-danger .stat-value { color: var(--danger); }
    .stat-success .stat-value { color: var(--success); }
    .stat-warning .stat-value { color: var(--moderate); }

    .tab-desc { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.25rem; }
    .issues-list { display: flex; flex-direction: column; gap: 0.75rem; }

    .after-success {
      display: flex;
      gap: 1.25rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      align-items: flex-start;
    }
    .after-icon { font-size: 2.5rem; flex-shrink: 0; }
    .after-success h2 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    .after-success p { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin-bottom: 0.5rem; }
    .caveat { color: var(--text-muted) !important; font-size: 0.8125rem !important; }

    .fix-list { display: flex; flex-direction: column; gap: 1rem; }
    .fix-entry { padding: 1.25rem; }
    .fix-header-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    .rule-id {
      background: var(--surface-2);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .fix-title { font-weight: 500; font-size: 0.9rem; }
    .code-comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
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
    .html-block { max-height: 500px; overflow-y: auto; }
    .fix-explanation { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; }

    .demo-cta {
      text-align: center;
      padding: 2.5rem;
      margin-top: 3rem;
    }
    .demo-cta h2 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .demo-cta p { color: var(--text-secondary); margin-bottom: 1.5rem; }

    @media (max-width: 600px) {
      .code-comparison { grid-template-columns: 1fr; }
    }
  `]
})
export class DemoComponent implements OnInit {
  result: ScanResult | null = null;
  loading = true;
  error = '';
  activeTab: 'before' | 'after' | 'html' = 'before';
  selectedViolation: Violation | null = null;

  demoFixes = [
    {
      ruleId: 'image-alt',
      issue: 'Missing image alt text',
      impact: 'critical' as const,
      before: '<img src="logo.png">',
      after: '<img src="logo.png" alt="Company logo">',
      explanation: 'Alt text allows screen readers to describe images to users who cannot see them.'
    },
    {
      ruleId: 'label',
      issue: 'Form input without a label',
      impact: 'critical' as const,
      before: '<input type="email" placeholder="Enter email">',
      after: '<label for="email">Email address</label>\n<input id="email" type="email" placeholder="Enter email">',
      explanation: 'Labels are announced by screen readers and allow users to understand what each field requires.'
    },
    {
      ruleId: 'html-has-lang',
      issue: 'Missing lang attribute on <html>',
      impact: 'serious' as const,
      before: '<html>',
      after: '<html lang="en">',
      explanation: 'The lang attribute tells screen readers which language to use for pronunciation.'
    },
    {
      ruleId: 'document-title',
      issue: 'Missing page title',
      impact: 'serious' as const,
      before: '<head><meta charset="utf-8"></head>',
      after: '<head><meta charset="utf-8"><title>My Page Title</title></head>',
      explanation: 'Page titles are the first thing screen reader users hear when navigating between tabs or pages.'
    },
    {
      ruleId: 'link-name',
      issue: 'Link without accessible text',
      impact: 'serious' as const,
      before: '<a href="/dashboard"><img src="icon.svg"></a>',
      after: '<a href="/dashboard" aria-label="Go to dashboard"><img src="icon.svg" alt=""></a>',
      explanation: 'Links must have a descriptive name so users know their destination before activating them.'
    }
  ];

  sampleHtml = `<!DOCTYPE html>
<html>
<head>
  <!-- Missing: <title> element -->
  <meta charset="utf-8">
</head>
<body>
  <!-- Issue: img missing alt attribute -->
  <img src="logo.png">

  <!-- Issue: form input without associated label -->
  <form>
    <input type="email" placeholder="Enter email">
    <button type="submit">Subscribe</button>
  </form>

  <!-- Issue: link with no accessible text -->
  <nav>
    <a href="/home"><img src="home-icon.svg"></a>
  </nav>

  <!-- Issue: heading order skipped (h1 to h3) -->
  <h1>Welcome</h1>
  <h3>Our Services</h3>

  <p>Contact us at
    <!-- Issue: link with non-descriptive text -->
    <a href="/contact">click here</a>
  </p>
</body>
</html>`;

  constructor(private scanService: ScanService) {}

  ngOnInit(): void {
    this.scanService.getDemoResults().subscribe({
      next: res => {
        this.result = res;
        this.loading = false;
      },
      error: (err: Error) => {
        this.loading = false;
        this.error = err.message || 'Could not load demo results. Please ensure the backend is running.';
      }
    });
  }

  openDetail(violation: Violation): void {
    this.selectedViolation = violation;
    document.body.style.overflow = 'hidden';
  }

  closeDetail(): void {
    this.selectedViolation = null;
    document.body.style.overflow = '';
  }
}
