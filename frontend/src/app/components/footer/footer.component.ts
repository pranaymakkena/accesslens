import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="footer" role="contentinfo">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <span class="brand">🔍 AccessLens</span>
            <p>An open-source tool to detect web accessibility issues and suggest beginner-friendly fixes.</p>
            <p class="disclaimer">
              ⚠️ Automated scanning detects a subset of accessibility issues only. Full WCAG compliance requires manual testing with assistive technologies.
            </p>
          </div>
          <div class="footer-links">
            <h3>Product</h3>
            <ul>
              <li><a routerLink="/">Scanner</a></li>
              <li><a routerLink="/demo">Live Demo</a></li>
            </ul>
          </div>
          <div class="footer-links">
            <h3>Open Source</h3>
            <ul>
              <li><a href="https://github.com/PLACEHOLDER/accesslens" target="_blank" rel="noopener">GitHub Repository</a></li>
              <li><a href="https://github.com/PLACEHOLDER/accesslens/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">Contributing Guide</a></li>
              <li><a href="https://github.com/PLACEHOLDER/accesslens/security/policy" target="_blank" rel="noopener">Security Policy</a></li>
              <li><a href="https://github.com/PLACEHOLDER/accesslens/blob/main/CHANGELOG.md" target="_blank" rel="noopener">Changelog</a></li>
            </ul>
          </div>
          <div class="footer-links">
            <h3>Resources</h3>
            <ul>
              <li><a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener">WCAG 2.1 Reference</a></li>
              <li><a href="https://www.deque.com/axe/" target="_blank" rel="noopener">axe-core Rules</a></li>
              <li><a href="https://webaim.org/" target="_blank" rel="noopener">WebAIM</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 AccessLens · MIT License · Built for the AI Builder Challenge</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #1e293b;
      color: #94a3b8;
      margin-top: 4rem;
      padding: 3rem 0 1.5rem;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .brand {
      display: block;
      font-size: 1.1rem;
      font-weight: 700;
      color: white;
      margin-bottom: 0.75rem;
    }
    .footer-brand p {
      font-size: 0.875rem;
      line-height: 1.6;
      margin-bottom: 0.75rem;
    }
    .disclaimer {
      font-size: 0.8rem !important;
      background: rgba(245,158,11,0.1);
      border: 1px solid rgba(245,158,11,0.3);
      padding: 0.75rem;
      border-radius: 6px;
      color: #fbbf24 !important;
    }
    .footer-links h3 {
      color: white;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .footer-links ul { list-style: none; }
    .footer-links li { margin-bottom: 0.5rem; }
    .footer-links a {
      color: #94a3b8;
      font-size: 0.875rem;
      text-decoration: none;
      transition: color 0.15s;
    }
    .footer-links a:hover { color: white; }
    .footer-bottom {
      border-top: 1px solid #334155;
      padding-top: 1.5rem;
      text-align: center;
      font-size: 0.8125rem;
    }
    @media (max-width: 768px) {
      .footer-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 480px) {
      .footer-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class FooterComponent {}
