import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ScanService } from '../../services/scan.service';

@Component({
  selector: 'app-landing',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="landing">
      <!-- Hero -->
      <section class="hero" aria-labelledby="hero-heading">
        <div class="container-sm">
          <div class="hero-content">
            <div class="hero-badge">Open Source · Free · No Sign-up Required</div>
            <h1 id="hero-heading">Make the web usable<br><span class="accent">for everyone.</span></h1>
            <p class="hero-sub">
              AccessLens scans any public webpage for accessibility issues, explains what's wrong in plain English, and suggests specific code fixes — no accessibility expertise required.
            </p>

            <form class="scan-form" (ngSubmit)="startScan()" aria-label="URL scanner form" novalidate>
              <div class="input-group" [class.input-error]="urlError">
                <label for="url-input" class="sr-only">Website URL to scan</label>
                <span class="input-prefix" aria-hidden="true">🌐</span>
                <input
                  id="url-input"
                  type="url"
                  [(ngModel)]="url"
                  name="url"
                  placeholder="https://example.com"
                  class="url-input"
                  [disabled]="scanning"
                  (input)="urlError = ''"
                  autocomplete="url"
                  aria-describedby="url-hint url-error"
                  required
                />
                <button
                  type="submit"
                  class="btn btn-primary scan-btn"
                  [disabled]="scanning || !url.trim()"
                  aria-label="Scan website for accessibility issues">
                  <span *ngIf="!scanning">Scan Website</span>
                  <span *ngIf="scanning" class="loading-text">
                    <span class="spinner-small" aria-hidden="true"></span>
                    Scanning...
                  </span>
                </button>
              </div>
              <div id="url-error" class="url-error-msg" role="alert" *ngIf="urlError">
                {{ urlError }}
              </div>
              <p id="url-hint" class="url-hint">
                Only public URLs are supported. Scans may take up to 30 seconds.
              </p>
            </form>

            <div class="or-divider" aria-hidden="true"><span>or</span></div>

            <button class="btn btn-outline demo-btn" (click)="viewDemo()" type="button">
              📋 View Sample Scan Results
            </button>
          </div>
        </div>
      </section>

      <!-- What we check -->
      <section class="checks-section" aria-labelledby="checks-heading">
        <div class="container">
          <h2 id="checks-heading" class="section-title">What AccessLens checks</h2>
          <p class="section-sub">Using the industry-standard <a href="https://github.com/dequelabs/axe-core" target="_blank" rel="noopener">axe-core</a> engine, AccessLens detects:</p>
          <div class="checks-grid">
            <div class="check-item card" *ngFor="let check of checks">
              <span class="check-icon" aria-hidden="true">{{ check.icon }}</span>
              <h3>{{ check.title }}</h3>
              <p>{{ check.desc }}</p>
            </div>
          </div>

          <div class="alert alert-warning limitation-notice" role="note">
            <span aria-hidden="true">⚠️</span>
            <div>
              <strong>Important limitation:</strong> Automated tools like AccessLens can detect only a subset of accessibility issues — typically around 30–40% of WCAG 2.1 success criteria. Full compliance always requires manual testing with assistive technologies such as screen readers, keyboard-only navigation, and expert review.
            </div>
          </div>
        </div>
      </section>

      <!-- How it works -->
      <section class="how-section" aria-labelledby="how-heading">
        <div class="container">
          <h2 id="how-heading" class="section-title">How it works</h2>
          <div class="steps-grid">
            <div class="step" *ngFor="let step of steps; let i = index">
              <div class="step-num" aria-hidden="true">{{ i + 1 }}</div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing { padding-bottom: 4rem; }

    /* Hero */
    .hero {
      background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
      padding: 5rem 0 4rem;
      border-bottom: 1px solid var(--border);
    }
    .hero-content { text-align: center; max-width: 720px; margin: 0 auto; }
    .hero-badge {
      display: inline-flex;
      background: var(--primary-light);
      color: var(--primary);
      padding: 0.3rem 1rem;
      border-radius: 100px;
      font-size: 0.8125rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }
    h1 {
      font-size: clamp(2rem, 5vw, 3.25rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 1.25rem;
      line-height: 1.15;
    }
    .accent { color: var(--primary); }
    .hero-sub {
      font-size: 1.125rem;
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 2.5rem;
      max-width: 560px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Scan form */
    .scan-form { margin-bottom: 1rem; }
    .input-group {
      display: flex;
      align-items: center;
      background: white;
      border: 2px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 0.375rem 0.375rem 0.375rem 1rem;
      box-shadow: var(--shadow);
      transition: border-color 0.15s;
      gap: 0.5rem;
    }
    .input-group:focus-within { border-color: var(--border-focus); }
    .input-group.input-error { border-color: var(--danger); }
    .input-prefix { font-size: 1.1rem; flex-shrink: 0; }
    .url-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 1rem;
      font-family: inherit;
      background: transparent;
      color: var(--text);
      min-width: 0;
    }
    .url-input::placeholder { color: var(--text-muted); }
    .url-input:disabled { opacity: 0.7; }
    .scan-btn { flex-shrink: 0; }
    .loading-text { display: flex; align-items: center; gap: 0.5rem; }
    .spinner-small {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }
    .url-error-msg { color: var(--danger); font-size: 0.875rem; margin-top: 0.5rem; text-align: left; }
    .url-hint { font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.625rem; }
    .or-divider {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1.5rem 0;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .or-divider::before, .or-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }
    .demo-btn { width: 100%; justify-content: center; }

    /* Checks section */
    .checks-section { padding: 4rem 0; }
    .section-title {
      text-align: center;
      font-size: 1.875rem;
      margin-bottom: 0.75rem;
    }
    .section-sub {
      text-align: center;
      color: var(--text-secondary);
      margin-bottom: 2.5rem;
    }
    .checks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .check-item {
      padding: 1.5rem;
    }
    .check-icon { font-size: 1.75rem; display: block; margin-bottom: 0.875rem; }
    .check-item h3 { font-size: 1rem; margin-bottom: 0.5rem; }
    .check-item p { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; }
    .limitation-notice { max-width: 720px; margin: 0 auto; }

    /* How it works */
    .how-section { background: var(--surface-2); padding: 4rem 0; }
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }
    .step { text-align: center; }
    .step-num {
      width: 2.5rem;
      height: 2.5rem;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      margin: 0 auto 1rem;
    }
    .step h3 { font-size: 1rem; margin-bottom: 0.5rem; }
    .step p { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0,0,0,0);
      white-space: nowrap;
      border: 0;
    }

    @media (max-width: 600px) {
      .hero { padding: 3rem 0; }
      .input-group { flex-direction: column; align-items: stretch; padding: 0.75rem; }
      .url-input { padding: 0.25rem 0; }
      .scan-btn { width: 100%; justify-content: center; }
      .input-prefix { display: none; }
    }
  `]
})
export class LandingComponent {
  url = '';
  scanning = false;
  urlError = '';

  checks = [
    { icon: '🖼️', title: 'Missing image alt text', desc: 'Images without descriptive alternative text are invisible to screen reader users.' },
    { icon: '🏷️', title: 'Form inputs without labels', desc: 'Form fields need accessible names so users know what to enter.' },
    { icon: '🎨', title: 'Insufficient color contrast', desc: 'Low-contrast text is hard to read for users with visual impairments.' },
    { icon: '🌐', title: 'Missing document language', desc: 'The HTML lang attribute helps screen readers use the correct pronunciation.' },
    { icon: '🔗', title: 'Links without descriptive text', desc: '"Click here" links give no context to screen reader users.' },
    { icon: '📋', title: 'Invalid ARIA attributes', desc: 'Incorrect ARIA usage can make interactive elements inaccessible.' },
    { icon: '📄', title: 'Missing page title', desc: 'Every page needs a meaningful title for navigation and identification.' },
    { icon: '🔤', title: 'Heading structure issues', desc: 'Skipping heading levels breaks navigation for screen reader users.' }
  ];

  steps = [
    { title: 'Enter a URL', desc: 'Provide the address of any publicly accessible webpage.' },
    { title: 'Scan runs automatically', desc: 'AccessLens loads the page in a headless browser and runs axe-core checks.' },
    { title: 'Review findings', desc: 'Issues are organized by severity with plain-English explanations.' },
    { title: 'Apply suggested fixes', desc: 'Review code fix suggestions for common issues before applying them.' },
    { title: 'Export your report', desc: 'Download an HTML report to share with your team or track progress.' }
  ];

  constructor(private scanService: ScanService, private router: Router) {}

  startScan(): void {
    this.urlError = '';
    const trimmed = this.url.trim();

    if (!trimmed) {
      this.urlError = 'Please enter a URL to scan.';
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      this.urlError = 'URL must start with http:// or https://';
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      this.urlError = 'Please enter a valid URL (e.g., https://example.com)';
      return;
    }

    this.scanning = true;

    this.scanService.startScan({ url: trimmed }).subscribe({
      next: result => {
        this.scanning = false;
        this.router.navigate(['/results', result.id]);
      },
      error: (err: Error) => {
        this.scanning = false;
        this.urlError = err.message || 'Failed to start scan. Please check the URL and try again.';
      }
    });
  }

  viewDemo(): void {
    this.router.navigate(['/demo']);
  }
}
