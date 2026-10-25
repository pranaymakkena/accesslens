export type ScanStatus = 'PENDING' | 'SCANNING' | 'COMPLETE' | 'FAILED';
export type ImpactLevel = 'critical' | 'serious' | 'moderate' | 'minor' | null;

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
