import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header" role="banner">
      <div class="container">
        <a routerLink="/" class="logo" aria-label="AccessLens home">
          <span class="logo-icon" aria-hidden="true">🔍</span>
          <span class="logo-text">Access<span class="logo-accent">Lens</span></span>
        </a>
        <nav aria-label="Main navigation">
          <ul class="nav-links" role="list">
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Scanner</a></li>
            <li><a routerLink="/demo" routerLinkActive="active">Demo</a></li>
            <li>
              <a href="https://github.com/pranaymakkena/accesslens"
                 target="_blank" rel="noopener noreferrer"
                 class="nav-github">
                GitHub
              </a>
            </li>
          </ul>
        </nav>
        <a href="#main-content" class="skip-link">Skip to content</a>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow-sm);
    }
    .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--text);
    }
    .logo-icon { font-size: 1.4rem; }
    .logo-text {
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .logo-accent { color: var(--primary); }
    nav ul {
      display: flex;
      list-style: none;
      gap: 0.25rem;
    }
    nav a {
      padding: 0.4rem 0.875rem;
      border-radius: var(--radius);
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.15s;
    }
    nav a:hover, nav a.active {
      background: var(--primary-light);
      color: var(--primary);
    }
    .skip-link {
      position: absolute;
      top: -100px;
      left: 1rem;
      background: var(--primary);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0 0 var(--radius) var(--radius);
      z-index: 1000;
      font-size: 0.875rem;
      font-weight: 500;
      transition: top 0.15s;
    }
    .skip-link:focus { top: 0; }
    @media (max-width: 600px) {
      nav a { padding: 0.4rem 0.5rem; font-size: 0.8rem; }
      .logo-text { font-size: 1rem; }
    }
  `]
})
export class HeaderComponent {}
