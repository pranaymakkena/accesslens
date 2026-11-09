export type ScanStatus = 'PENDING' | 'SCANNING' | 'COMPLETE' | 'FAILED';
export type ImpactLevel = 'critical' | 'serious' | 'moderate' | 'minor' | null;
export type WcagPrinciple = 'perceivable' | 'operable' | 'understandable' | 'robust';

export interface ScanRequest {
  url: string;
}

export interface ViolationNode {
  html: string;
  target: string[];
  failureSummary: string;
}

export interface Violation {
  id: string;
  description: string;
  impact: ImpactLevel;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: ViolationNode[];
  nodeCount: number;
}

export interface ScanResult {
  id: string;
  url: string;
  status: ScanStatus;
  timestamp: string;
  violations: Violation[];
  passes: Violation[];
  incomplete: Violation[];
  inapplicable: Violation[];
  violationCount: number;
  passCount: number;
  incompleteCount: number;
  error?: string;
}

export interface FixSuggestion {
  ruleId: string;
  title: string;
  explanation: string;
  whyItMatters: string;
  before: string;
  after: string;
  wcagReference: string;
  verificationSteps: string[];
  manualSteps: string[];
}

export interface ImpactGroup {
  impact: ImpactLevel;
  label: string;
  color: string;
  violations: Violation[];
}

// ── New feature models ──────────────────────────────────────────────────────

/** Computed accessibility score and grade for a scan result */
export interface AccessibilityScore {
  score: number;          // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  gradeColor: string;
  breakdown: { critical: number; serious: number; moderate: number; minor: number };
  totalChecks: number;
}

/** Pass/fail counts per WCAG principle */
export interface WcagPrincipleBreakdown {
  principle: WcagPrinciple;
  label: string;
  icon: string;
  passed: number;
  failed: number;
  total: number;
  pct: number;
}

/** A prioritised fix recommendation */
export interface RemediationItem {
  rank: number;
  violation: Violation;
  estimatedImpact: 'high' | 'medium' | 'low';
  affectedUsers: string;
  effort: 'easy' | 'medium' | 'hard';
  effortLabel: string;
  roiScore: number;   // higher = fix this first
}

/** Cytoscape.js graph data returned from /api/scans/{id}/graph */
export interface GraphData {
  elements: CytoscapeElement[];
  nodeCount: number;
}

export interface CytoscapeElement {
  data: CytoscapeNodeData | CytoscapeEdgeData;
}

export interface CytoscapeNodeData {
  id: string;
  tag: string;
  selector: string;
  severity: string;
  ariaHidden: boolean;
  focusBlocked: boolean;
  inShadowDom: boolean;
  violationRules: string[];
  label: string;
}

export interface CytoscapeEdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
}

/** Root cause component returned from /api/scans/{id}/graph/root-causes */
export interface RootCauseComponent {
  elementId: string;
  selector: string;
  tag: string;
  html: string;
  attrId: string | null;
  attrClass: string | null;
  distinctRules: number;
  totalViolations: number;
  affectedRules: string[];
  severities: string[];
}

/** WCAG criterion with live violation data from the graph */
export interface WcagGraphCriteria {
  criteriaId: string;
  name: string;
  level: string;
  principle: string;
  guideline: string;
  url: string;
  violationCount: number;
  ruleIds: string[];
  severities: string[];
}

/** aria-hidden cascade result */
export interface AriaHiddenCascade {
  hiddenAncestor: string;
  blockedDescendants: string[];
  blockedCount: number;
}

/** Stored in localStorage for scan history */
export interface ScanHistoryEntry {
  id: string;
  url: string;
  timestamp: string;
  score: number;
  grade: string;
  violationCount: number;
  passCount: number;
  incompleteCount: number;
}

