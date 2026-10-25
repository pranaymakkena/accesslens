import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Violation } from '../../models/scan.models';
import { SeverityBadgeComponent } from '../severity-badge/severity-badge.component';

@Component({
  selector: 'app-issue-card',
  imports: [CommonModule, SeverityBadgeComponent],
  template: `
    <article class="issue-card card" [attr.aria-label]="'Accessibility issue: ' + violation.id">
      <div class="issue-header">
        <div class="issue-meta">
          <app-severity-badge [impact]="violation.impact"></app-severity-badge>
          <code class="rule-id">{{ violation.id }}</code>
          <span class="node-count" *ngIf="violation.nodeCount > 0">
            {{ violation.nodeCount }} affected element{{ violation.nodeCount !== 1 ? 's' : '' }}
          </span>
        </div>
        <div class="wcag-tags">
          <span class="tag tag-info" *ngFor="let tag of wcagTags">{{ tag }}</span>
        </div>
      </div>

      <h3 class="issue-title">{{ violation.description }}</h3>
      <p class="issue-help">{{ violation.help }}</p>

      <div class="issue-actions">
        <button class="btn btn-primary btn-sm" (click)="viewDetails.emit(violation)" type="button">
          View Details &amp; Fix
        </button>
        <a [href]="violation.helpUrl" target="_blank" rel="noopener noreferrer"
           class="btn btn-secondary btn-sm">
          WCAG Reference ↗
        </a>
      </div>
    </article>
  `,
  styles: [`
    .issue-card {
      padding: 1.25rem;
      transition: box-shadow 0.15s;
    }
    .issue-card:hover { box-shadow: var(--shadow); }
    .issue-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .issue-meta {
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
    .node-count {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .wcag-tags {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }
    .issue-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.375rem;
    }
    .issue-help {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }
    .issue-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
  `]
})
export class IssueCardComponent {
  @Input() violation!: Violation;
  @Output() viewDetails = new EventEmitter<Violation>();

  get wcagTags(): string[] {
    return (this.violation.tags || []).filter(t => t.startsWith('wcag'));
  }
}
