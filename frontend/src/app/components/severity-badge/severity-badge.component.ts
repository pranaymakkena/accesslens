import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImpactLevel } from '../../models/scan.models';

@Component({
  selector: 'app-severity-badge',
  imports: [CommonModule],
  template: `
    <span class="tag" [ngClass]="'tag-' + (impact || 'info')" [attr.aria-label]="'Severity: ' + label">
      {{ label }}
    </span>
  `,
  styles: [``]
})
export class SeverityBadgeComponent {
  @Input() impact: ImpactLevel = null;

  get label(): string {
    const labels: Record<string, string> = {
      critical: 'Critical',
      serious: 'Serious',
      moderate: 'Moderate',
      minor: 'Minor'
    };
    return this.impact ? labels[this.impact] || this.impact : 'Unknown';
  }
}
