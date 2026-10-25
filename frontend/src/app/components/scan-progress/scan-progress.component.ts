import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scan-progress',
  imports: [CommonModule],
  template: `
    <div class="progress-container" role="status" aria-live="polite">
      <div class="progress-card card">
        <div class="spinner large-spinner" aria-hidden="true"></div>
        <h2>Scanning accessibility...</h2>
        <p class="progress-url">{{ url }}</p>
        <ul class="progress-steps" aria-label="Scan progress steps">
          <li *ngFor="let step of steps; let i = index"
              [class.active]="i === currentStep"
              [class.done]="i < currentStep"
              [attr.aria-current]="i === currentStep ? 'step' : null">
            <span class="step-icon" aria-hidden="true">
              {{ i < currentStep ? '✓' : i === currentStep ? '⟳' : '○' }}
            </span>
            {{ step }}
          </li>
        </ul>
        <p class="progress-note">This may take up to 30 seconds for large pages.</p>
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      display: flex;
      justify-content: center;
      padding: 4rem 1rem;
    }
    .progress-card {
      text-align: center;
      padding: 2.5rem;
      max-width: 480px;
      width: 100%;
    }
    .large-spinner {
      width: 3rem;
      height: 3rem;
      border-width: 4px;
      margin: 0 auto 1.5rem;
    }
    h2 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .progress-url {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
      word-break: break-all;
    }
    .progress-steps {
      list-style: none;
      text-align: left;
      display: inline-block;
      margin-bottom: 1.5rem;
    }
    .progress-steps li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.4rem 0;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .progress-steps li.done { color: var(--success); }
    .progress-steps li.active { color: var(--text); font-weight: 500; }
    .step-icon {
      width: 1.25rem;
      text-align: center;
      font-size: 0.875rem;
    }
    .progress-note { font-size: 0.8125rem; color: var(--text-muted); }
  `]
})
export class ScanProgressComponent {
  @Input() url = '';

  steps = [
    'Resolving and validating URL',
    'Launching headless browser',
    'Loading page content',
    'Injecting axe-core rules engine',
    'Running accessibility checks',
    'Processing results'
  ];

  currentStep = 2;
}
