import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ColorSuggestion { hex: string; ratio: number; }

@Component({
  selector: 'app-contrast-tool',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contrast-page container">
      <header class="page-header">
        <h1>🎨 Color Contrast Checker</h1>
        <p class="page-sub">Instantly verify WCAG 2.1 contrast ratios and get accessible color suggestions</p>
      </header>

      <div class="tool-layout">
        <!-- Input panel -->
        <div class="inputs-card card">
          <h2 class="card-heading">Color Pair</h2>
          <div class="color-inputs">
            <div class="color-input-group">
              <label for="fg-color">Foreground (text)</label>
              <div class="color-row">
                <input type="color" id="fg-color-picker" [(ngModel)]="fgColor"
                       (ngModelChange)="onColorChange()" class="color-swatch" aria-label="Foreground color picker"/>
                <input type="text" id="fg-color" [(ngModel)]="fgColor"
                       (ngModelChange)="onColorChange()" maxlength="7"
                       class="hex-input" placeholder="#000000" aria-label="Foreground hex color"/>
              </div>
            </div>
            <div class="swap-btn-wrap">
              <button class="btn btn-secondary btn-sm" (click)="swapColors()" type="button"
                      aria-label="Swap foreground and background colors">⇅ Swap</button>
            </div>
            <div class="color-input-group">
              <label for="bg-color">Background</label>
              <div class="color-row">
                <input type="color" id="bg-color-picker" [(ngModel)]="bgColor"
                       (ngModelChange)="onColorChange()" class="color-swatch" aria-label="Background color picker"/>
                <input type="text" id="bg-color" [(ngModel)]="bgColor"
                       (ngModelChange)="onColorChange()" maxlength="7"
                       class="hex-input" placeholder="#ffffff" aria-label="Background hex color"/>
              </div>
            </div>
          </div>

          <!-- Font size selector -->
          <div class="font-controls">
            <label for="font-size">Sample text size</label>
            <div class="font-row">
              <input type="range" id="font-size" [(ngModel)]="fontSize"
                     (ngModelChange)="onColorChange()" min="10" max="48" step="1" class="font-slider"/>
              <span class="font-val">{{ fontSize }}px</span>
            </div>
          </div>
        </div>

        <!-- Preview & result -->
        <div class="preview-card card">
          <h2 class="card-heading">Preview</h2>
          <div class="text-preview"
               [style.background]="bgColor"
               [style.color]="fgColor"
               [style.font-size.px]="fontSize"
               aria-live="polite"
               [attr.aria-label]="'Preview text at contrast ratio ' + ratio">
            The quick brown fox jumps over the lazy dog.
            <br/>
            <strong>Bold text sample 1234567890</strong>
          </div>

          <div class="ratio-display">
            <span class="ratio-value" [class.ratio-pass]="aaPass" [class.ratio-fail]="!aaPass">
              {{ ratio }}:1
            </span>
            <span class="ratio-label">Contrast Ratio</span>
          </div>

          <div class="wcag-results">
            <div class="wcag-row" [class.pass]="aaPass" [class.fail]="!aaPass">
              <span class="result-icon">{{ aaPass ? '✅' : '❌' }}</span>
              <div class="result-info">
                <strong>WCAG AA Normal Text</strong>
                <span>Requires 4.5:1</span>
              </div>
              <span class="result-badge" [class.badge-pass]="aaPass" [class.badge-fail]="!aaPass">
                {{ aaPass ? 'PASS' : 'FAIL' }}
              </span>
            </div>
            <div class="wcag-row" [class.pass]="aaLargePass" [class.fail]="!aaLargePass">
              <span class="result-icon">{{ aaLargePass ? '✅' : '❌' }}</span>
              <div class="result-info">
                <strong>WCAG AA Large Text</strong>
                <span>Requires 3:1 (18pt+ or 14pt+ bold)</span>
              </div>
              <span class="result-badge" [class.badge-pass]="aaLargePass" [class.badge-fail]="!aaLargePass">
                {{ aaLargePass ? 'PASS' : 'FAIL' }}
              </span>
            </div>
            <div class="wcag-row" [class.pass]="aaaPass" [class.fail]="!aaaPass">
              <span class="result-icon">{{ aaaPass ? '✅' : '❌' }}</span>
              <div class="result-info">
                <strong>WCAG AAA Enhanced</strong>
                <span>Requires 7:1</span>
              </div>
              <span class="result-badge" [class.badge-pass]="aaaPass" [class.badge-fail]="!aaaPass">
                {{ aaaPass ? 'PASS' : 'FAIL' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div class="suggestions-card card" *ngIf="suggestions.length > 0">
        <h2 class="card-heading">💡 Accessible Alternatives</h2>
        <p class="card-sub">Adjusted foreground colors that pass WCAG AA on your background</p>
        <div class="suggestions-grid">
          <button class="suggestion-swatch"
            *ngFor="let s of suggestions"
            (click)="applySuggestion(s)"
            type="button"
            [style.background]="bgColor"
            [style.color]="s.hex"
            [attr.aria-label]="'Use color ' + s.hex + ' with ratio ' + s.ratio + ':1'">
            <span class="swatch-text">Aa</span>
            <span class="swatch-hex">{{ s.hex }}</span>
            <span class="swatch-ratio">{{ s.ratio }}:1</span>
          </button>
        </div>
      </div>

      <!-- Common palettes -->
      <div class="palettes-card card">
        <h2 class="card-heading">🎨 Accessible Color Palettes</h2>
        <div class="palettes-grid">
          <button class="palette-pair"
            *ngFor="let p of presets"
            (click)="applyPreset(p)"
            type="button"
            [style.background]="p.bg"
            [style.color]="p.fg"
            [attr.aria-label]="p.name + ': ' + p.ratio + ':1 contrast'">
            <span class="palette-name">{{ p.name }}</span>
            <span class="palette-ratio">{{ p.ratio }}:1</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contrast-page { padding:2rem 1.5rem 4rem; max-width:1000px; }
    .page-header { margin-bottom:2rem; }
    .page-header h1 { font-size:1.75rem; margin-bottom:0.5rem; }
    .page-sub { color:var(--text-secondary); font-size:0.95rem; }
    .tool-layout { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem; }
    .card-heading { font-size:1rem; font-weight:600; margin-bottom:1rem; }
    .card-sub { font-size:0.8rem; color:var(--text-secondary); margin-bottom:1rem; }
    .inputs-card,.preview-card { padding:1.5rem; }
    .color-inputs { display:flex; flex-direction:column; gap:1rem; margin-bottom:1.25rem; }
    .color-input-group label { display:block; font-size:0.85rem; font-weight:500; margin-bottom:0.375rem; }
    .color-row { display:flex; gap:0.5rem; align-items:center; }
    .color-swatch { width:40px; height:40px; border:1px solid var(--border); border-radius:var(--radius);
      cursor:pointer; padding:2px; flex-shrink:0; }
    .hex-input { flex:1; padding:0.5rem 0.75rem; border:1px solid var(--border); border-radius:var(--radius);
      font-family:'JetBrains Mono',monospace; font-size:0.9rem; }
    .hex-input:focus { outline:2px solid var(--primary); border-color:var(--primary); }
    .swap-btn-wrap { text-align:center; }
    .font-controls label { display:block; font-size:0.85rem; font-weight:500; margin-bottom:0.375rem; }
    .font-row { display:flex; align-items:center; gap:0.75rem; }
    .font-slider { flex:1; }
    .font-val { font-size:0.85rem; font-weight:600; width:2.5rem; text-align:right; }
    .text-preview { padding:1.5rem; border-radius:var(--radius); margin-bottom:1.25rem;
      min-height:80px; line-height:1.6; transition:all 0.2s; border:1px solid var(--border); }
    .ratio-display { display:flex; align-items:baseline; gap:0.5rem; margin-bottom:1.25rem; }
    .ratio-value { font-size:2.5rem; font-weight:700; }
    .ratio-pass { color:var(--success); }
    .ratio-fail { color:var(--danger); }
    .ratio-label { font-size:0.875rem; color:var(--text-secondary); }
    .wcag-results { display:flex; flex-direction:column; gap:0.5rem; }
    .wcag-row { display:flex; align-items:center; gap:0.75rem; padding:0.75rem;
      border-radius:var(--radius); border:1px solid var(--border); }
    .wcag-row.pass { background:#f0fdf4; border-color:#bbf7d0; }
    .wcag-row.fail { background:#fef2f2; border-color:#fecaca; }
    .result-icon { font-size:1rem; flex-shrink:0; }
    .result-info { flex:1; }
    .result-info strong { display:block; font-size:0.875rem; }
    .result-info span { font-size:0.775rem; color:var(--text-muted); }
    .result-badge { font-size:0.75rem; font-weight:700; padding:0.15rem 0.5rem; border-radius:4px; }
    .badge-pass { background:#16a34a; color:white; }
    .badge-fail { background:#dc2626; color:white; }
    .suggestions-card { padding:1.5rem; margin-bottom:1.5rem; }
    .suggestions-grid { display:flex; gap:0.75rem; flex-wrap:wrap; }
    .suggestion-swatch { width:90px; height:90px; border-radius:var(--radius); border:1px solid var(--border);
      display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.125rem;
      cursor:pointer; transition:transform 0.1s; }
    .suggestion-swatch:hover { transform:scale(1.05); }
    .swatch-text { font-size:1.5rem; font-weight:700; }
    .swatch-hex,.swatch-ratio { font-size:0.65rem; font-family:'JetBrains Mono',monospace; }
    .palettes-card { padding:1.5rem; }
    .palettes-grid { display:flex; gap:0.75rem; flex-wrap:wrap; }
    .palette-pair { width:120px; height:60px; border-radius:var(--radius); border:1px solid var(--border);
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      cursor:pointer; font-weight:600; transition:transform 0.1s; }
    .palette-pair:hover { transform:scale(1.04); }
    .palette-name { font-size:0.775rem; }
    .palette-ratio { font-size:0.7rem; opacity:0.8; }
    @media(max-width:680px){ .tool-layout{grid-template-columns:1fr;} }
  `]
})
export class ContrastToolComponent implements OnInit {
  fgColor = '#1e293b';
  bgColor = '#ffffff';
  fontSize = 16;
  ratio = '1.00';
  aaPass = false;
  aaLargePass = false;
  aaaPass = false;
  suggestions: ColorSuggestion[] = [];

  presets = [
    { name: 'Night', fg: '#f8fafc', bg: '#0f172a', ratio: '19.3' },
    { name: 'Ocean', fg: '#ffffff', bg: '#1d4ed8', ratio: '7.4' },
    { name: 'Forest', fg: '#ffffff', bg: '#15803d', ratio: '5.2' },
    { name: 'Slate', fg: '#f1f5f9', bg: '#334155', ratio: '9.3' },
    { name: 'Amber', fg: '#1c1917', bg: '#fbbf24', ratio: '9.8' },
    { name: 'Rose', fg: '#ffffff', bg: '#be123c', ratio: '6.0' },
  ];

  ngOnInit(): void {
    this.onColorChange();
  }

  onColorChange(): void {
    if (!this.isValidHex(this.fgColor) || !this.isValidHex(this.bgColor)) return;
    const r = this.contrastRatio(this.fgColor, this.bgColor);
    this.ratio = r.toFixed(2);
    this.aaPass = r >= 4.5;
    this.aaLargePass = r >= 3;
    this.aaaPass = r >= 7;
    if (!this.aaPass) this.buildSuggestions();
    else this.suggestions = [];
  }

  swapColors(): void {
    const tmp = this.fgColor;
    this.fgColor = this.bgColor;
    this.bgColor = tmp;
    this.onColorChange();
  }

  applySuggestion(s: ColorSuggestion): void {
    this.fgColor = s.hex;
    this.onColorChange();
  }

  applyPreset(p: { fg: string; bg: string }): void {
    this.fgColor = p.fg;
    this.bgColor = p.bg;
    this.onColorChange();
  }

  private buildSuggestions(): void {
    const bg = this.hexToRgb(this.bgColor);
    if (!bg) { this.suggestions = []; return; }
    const fg = this.hexToRgb(this.fgColor);
    if (!fg) { this.suggestions = []; return; }

    const results: ColorSuggestion[] = [];
    // Darken and lighten the fg to find passing alternatives
    for (let factor = 0; factor <= 1; factor += 0.05) {
      const darkened = {
        r: Math.round(fg.r * (1 - factor)),
        g: Math.round(fg.g * (1 - factor)),
        b: Math.round(fg.b * (1 - factor)),
      };
      const hex = this.rgbToHex(darkened.r, darkened.g, darkened.b);
      const r = this.contrastRatio(hex, this.bgColor);
      if (r >= 4.5) {
        results.push({ hex, ratio: parseFloat(r.toFixed(1)) });
        break;
      }
    }
    for (let factor = 0; factor <= 1; factor += 0.05) {
      const lightened = {
        r: Math.round(fg.r + (255 - fg.r) * factor),
        g: Math.round(fg.g + (255 - fg.g) * factor),
        b: Math.round(fg.b + (255 - fg.b) * factor),
      };
      const hex = this.rgbToHex(lightened.r, lightened.g, lightened.b);
      const r = this.contrastRatio(hex, this.bgColor);
      if (r >= 4.5) {
        results.push({ hex, ratio: parseFloat(r.toFixed(1)) });
        break;
      }
    }
    // Pure black and white as fallbacks
    const blackRatio = this.contrastRatio('#000000', this.bgColor);
    const whiteRatio = this.contrastRatio('#ffffff', this.bgColor);
    if (blackRatio >= 4.5) results.push({ hex: '#000000', ratio: parseFloat(blackRatio.toFixed(1)) });
    if (whiteRatio >= 4.5) results.push({ hex: '#ffffff', ratio: parseFloat(whiteRatio.toFixed(1)) });

    // Deduplicate
    this.suggestions = results.filter((s, i) => results.findIndex(x => x.hex === s.hex) === i).slice(0, 6);
  }

  // ── Color math ─────────────────────────────────────────────────────────

  private contrastRatio(hex1: string, hex2: string): number {
    const l1 = this.relativeLuminance(hex1);
    const l2 = this.relativeLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  private relativeLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;
    const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return null;
    const n = parseInt(clean, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
  }

  private isValidHex(hex: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  }
}
