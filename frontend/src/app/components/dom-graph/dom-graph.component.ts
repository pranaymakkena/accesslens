import {
  Component, Input, OnChanges, OnDestroy, ElementRef,
  ViewChild, AfterViewInit, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import cytoscape from 'cytoscape';
import type { Core, NodeSingular, EventObject } from 'cytoscape';
import { GraphData } from '../../models/scan.models';

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#dc2626',
  serious:  '#ea580c',
  moderate: '#d97706',
  minor:    '#65a30d',
  none:     '#94a3b8',
};

@Component({
  selector: 'app-dom-graph',
  imports: [CommonModule],
  template: `
    <div class="graph-wrap" role="region" aria-label="Interactive DOM accessibility dependency graph">
      <!-- Legend -->
      <div class="graph-legend" aria-label="Node colour legend">
        <span class="legend-item" *ngFor="let l of legend">
          <span class="legend-dot" [style.background]="l.color" aria-hidden="true"></span>
          {{ l.label }}
        </span>
        <span class="legend-item">
          <span class="legend-icon" aria-hidden="true">👻</span>
          aria-hidden cascade
        </span>
        <span class="legend-item">
          <span class="legend-icon" aria-hidden="true">🌑</span>
          Shadow DOM
        </span>
      </div>

      <!-- Toolbar -->
      <div class="graph-toolbar">
        <button class="tbtn" (click)="cy?.fit()" type="button" title="Fit to screen" aria-label="Fit graph to screen">⊡</button>
        <button class="tbtn" (click)="cy?.zoom(cy!.zoom() * 1.25)" type="button" title="Zoom in" aria-label="Zoom in">+</button>
        <button class="tbtn" (click)="cy?.zoom(cy!.zoom() * 0.8)" type="button" title="Zoom out" aria-label="Zoom out">−</button>
        <button class="tbtn" (click)="resetLayout()" type="button" title="Re-run layout" aria-label="Re-run layout">↺</button>
        <span class="node-count" *ngIf="graphData">{{ graphData.nodeCount }} nodes</span>
      </div>

      <!-- Canvas -->
      <div #cytoscapeContainer class="cy-container" tabindex="0"
           [attr.aria-label]="'DOM graph with ' + (graphData?.nodeCount ?? 0) + ' elements'">
      </div>

      <!-- Selected node info -->
      <div class="node-info card" *ngIf="selectedNode" role="status" aria-live="polite">
        <div class="node-info-header">
          <code class="node-tag">{{ selectedNode.tag }}</code>
          <span class="node-severity-dot"
                [style.background]="getSeverityColor(selectedNode.severity)"
                [attr.aria-label]="'Severity: ' + selectedNode.severity">
          </span>
          <button class="close-info" (click)="selectedNode = null" type="button" aria-label="Close node info">✕</button>
        </div>
        <div class="node-info-body">
          <div class="info-row">
            <span class="info-label">Selector</span>
            <code class="info-val">{{ selectedNode.selector }}</code>
          </div>
          <div class="info-row" *ngIf="selectedNode.ariaHidden">
            <span class="info-label">⚠️ Blocked</span>
            <span class="info-val">aria-hidden="true" hides this subtree from screen readers</span>
          </div>
          <div class="info-row" *ngIf="selectedNode.focusBlocked">
            <span class="info-label">⚠️ Focus</span>
            <span class="info-val">tabindex="-1" removes from keyboard tab order</span>
          </div>
          <div class="info-row" *ngIf="selectedNode.inShadowDom">
            <span class="info-label">🌑 Shadow DOM</span>
            <span class="info-val">Inside a Shadow DOM root — most tools miss this</span>
          </div>
          <div class="info-row" *ngIf="selectedNode.violationRules?.length">
            <span class="info-label">Violations</span>
            <div class="info-tags">
              <code class="rule-tag" *ngFor="let r of selectedNode.violationRules">{{ r }}</code>
            </div>
          </div>
        </div>
      </div>

      <div class="graph-empty" *ngIf="!graphData || graphData.nodeCount === 0">
        <p>No graph data yet. Graph builds asynchronously after scan completes.</p>
      </div>
    </div>
  `,
  styles: [`
    .graph-wrap { position:relative; background:var(--surface); border-radius:var(--radius-lg);
      border:1px solid var(--border); overflow:hidden; }
    .graph-legend { display:flex; flex-wrap:wrap; gap:0.75rem; padding:0.75rem 1rem;
      border-bottom:1px solid var(--border); font-size:0.775rem; background:var(--surface-2); }
    .legend-item { display:flex; align-items:center; gap:0.375rem; }
    .legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .legend-icon { font-size:0.9rem; }
    .graph-toolbar { position:absolute; top:44px; right:0.75rem; z-index:10;
      display:flex; align-items:center; gap:0.375rem; padding:0.375rem;
      background:rgba(255,255,255,0.9); border:1px solid var(--border);
      border-radius:var(--radius); backdrop-filter:blur(4px); }
    .tbtn { width:28px; height:28px; border:1px solid var(--border); border-radius:4px;
      background:white; cursor:pointer; font-size:1rem; display:flex; align-items:center;
      justify-content:center; transition:background 0.1s; }
    .tbtn:hover { background:var(--primary-light); color:var(--primary); }
    .node-count { font-size:0.75rem; color:var(--text-muted); padding-left:0.25rem; }
    .cy-container { width:100%; height:520px; }
    .node-info { position:absolute; bottom:1rem; left:1rem; max-width:360px; width:100%;
      padding:1rem; box-shadow:var(--shadow-lg); z-index:20; }
    .node-info-header { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.75rem; }
    .node-tag { background:var(--surface-2); padding:0.15rem 0.5rem; border-radius:4px;
      font-size:0.875rem; flex:1; }
    .node-severity-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; }
    .close-info { background:none; border:none; cursor:pointer; color:var(--text-muted);
      font-size:1rem; padding:0.1rem; border-radius:4px; margin-left:auto; }
    .close-info:hover { background:var(--surface-2); }
    .node-info-body { display:flex; flex-direction:column; gap:0.5rem; }
    .info-row { display:flex; gap:0.5rem; align-items:flex-start; font-size:0.8rem; }
    .info-label { font-weight:600; min-width:5rem; color:var(--text-secondary); flex-shrink:0; }
    .info-val { color:var(--text); word-break:break-all; }
    code.info-val { background:var(--surface-2); padding:0.1rem 0.3rem; border-radius:3px;
      font-size:0.75rem; word-break:break-all; }
    .info-tags { display:flex; flex-wrap:wrap; gap:0.25rem; }
    .rule-tag { background:#fef2f2; color:#dc2626; border:1px solid #fecaca;
      font-size:0.7rem; padding:0.1rem 0.35rem; border-radius:3px; }
    .graph-empty { text-align:center; padding:3rem; color:var(--text-muted); font-size:0.875rem; }
  `]
})
export class DomGraphComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() graphData: GraphData | null = null;
  @ViewChild('cytoscapeContainer') containerRef!: ElementRef<HTMLDivElement>;

  cy: Core | null = null;
  selectedNode: any = null;

  legend = [
    { label: 'Critical', color: SEVERITY_COLOR['critical'] },
    { label: 'Serious',  color: SEVERITY_COLOR['serious']  },
    { label: 'Moderate', color: SEVERITY_COLOR['moderate'] },
    { label: 'Minor',    color: SEVERITY_COLOR['minor']    },
    { label: 'Clean',    color: SEVERITY_COLOR['none']     },
  ];

  ngAfterViewInit(): void {
    if (this.graphData) this.renderGraph();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graphData'] && this.containerRef) {
      this.renderGraph();
    }
  }

  ngOnDestroy(): void {
    this.cy?.destroy();
  }

  renderGraph(): void {
    if (!this.containerRef || !this.graphData?.elements?.length) return;
    this.cy?.destroy();

    this.cy = cytoscape({
      container: this.containerRef.nativeElement,
      elements: this.graphData.elements as any,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '10px',
            'font-family': 'Inter, system-ui, sans-serif',
            'text-wrap': 'wrap',
            'text-max-width': '80px',
            'width': 60,
            'height': 60,
            'background-color': (ele: NodeSingular) =>
              SEVERITY_COLOR[ele.data('severity') as string] || SEVERITY_COLOR['none'],
            'border-width': (ele: NodeSingular) => ele.data('ariaHidden') ? 3 : 1,
            'border-color': (ele: NodeSingular) =>
              ele.data('ariaHidden') ? '#7c3aed' :
              ele.data('inShadowDom') ? '#0f172a' : '#e2e8f0',
            'border-style': (ele: NodeSingular) => ele.data('ariaHidden') ? 'dashed' : 'solid',
            'color': '#ffffff',
            'text-outline-color': '#00000080',
            'text-outline-width': 1,
            'shape': (ele: NodeSingular) =>
              ele.data('inShadowDom') ? 'diamond' :
              ele.data('ariaHidden') ? 'hexagon' : 'ellipse',
            'opacity': (ele: NodeSingular) => ele.data('ariaHidden') ? 0.7 : 1,
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#cbd5e1',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.7,
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 3,
            'border-color': '#4f46e5',
          }
        },
        {
          selector: 'node[severity = "critical"]',
          style: { 'width': 80, 'height': 80 }
        },
        {
          selector: 'node[severity = "serious"]',
          style: { 'width': 70, 'height': 70 }
        }
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 20,
        spacingFactor: 1.4,
      } as any,
      wheelSensitivity: 0.3,
    });

    // Show node info on tap
    this.cy.on('tap', 'node', (evt: EventObject) => {
      const d = evt.target.data();
      this.selectedNode = d.tag ? d : null;
    });

    this.cy.on('tap', (evt: EventObject) => {
      if (evt.target === this.cy) this.selectedNode = null;
    });
  }

  resetLayout(): void {
    this.cy?.layout({ name: 'breadthfirst', directed: true, padding: 20, spacingFactor: 1.4 } as any).run();
  }

  getSeverityColor(s: string): string {
    return SEVERITY_COLOR[s] || SEVERITY_COLOR['none'];
  }
}
