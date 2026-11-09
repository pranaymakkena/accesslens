import { Injectable } from '@angular/core';
import {
  ScanResult, AccessibilityScore, WcagPrincipleBreakdown,
  RemediationItem, ScanHistoryEntry, Violation
} from '../models/scan.models';

/** Maps axe-core rule IDs to WCAG principles */
const RULE_PRINCIPLE_MAP: Record<string, string> = {
  // Perceivable
  'image-alt': 'perceivable', 'image-redundant-alt': 'perceivable',
  'color-contrast': 'perceivable', 'color-contrast-enhanced': 'perceivable',
  'audio-caption': 'perceivable', 'video-caption': 'perceivable',
  'video-description': 'perceivable', 'object-alt': 'perceivable',
  'input-image-alt': 'perceivable', 'svg-img-alt': 'perceivable',
  'frame-title': 'perceivable', 'frame-title-unique': 'perceivable',
  'landmark-banner-is-top-level': 'perceivable',
  'landmark-contentinfo-is-top-level': 'perceivable',
  'landmark-main-is-top-level': 'perceivable', 'landmark-no-duplicate-banner': 'perceivable',
  'landmark-no-duplicate-contentinfo': 'perceivable', 'landmark-one-main': 'perceivable',
  'landmark-unique': 'perceivable', 'region': 'perceivable',
  // Operable
  'keyboard': 'operable', 'focus-order-semantics': 'operable',
  'focus-trap': 'operable', 'tabindex': 'operable',
  'skip-link': 'operable', 'bypass': 'operable',
  'document-title': 'operable', 'link-name': 'operable',
  'duplicate-id-active': 'operable', 'focus-visible': 'operable',
  'button-name': 'operable', 'scrollable-region-focusable': 'operable',
  'select-name': 'operable',
  // Understandable
  'html-has-lang': 'understandable', 'html-lang-valid': 'understandable',
  'label': 'understandable', 'label-title-only': 'understandable',
  'autocomplete-valid': 'understandable', 'heading-order': 'understandable',
  'meta-refresh': 'understandable', 'meta-viewport': 'understandable',
  'identical-links-same-purpose': 'understandable',
  // Robust
  'duplicate-id': 'robust', 'duplicate-id-aria': 'robust',
  'aria-allowed-attr': 'robust', 'aria-required-attr': 'robust',
  'aria-required-children': 'robust', 'aria-required-parent': 'robust',
  'aria-roles': 'robust', 'aria-valid-attr': 'robust',
  'aria-valid-attr-value': 'robust', 'aria-hidden-body': 'robust',
  'aria-hidden-focus': 'robust', 'aria-input-field-name': 'robust',
  'aria-toggle-field-name': 'robust', 'aria-command-name': 'robust',
  'aria-meter-name': 'robust', 'aria-progressbar-name': 'robust',
  'aria-tooltip-name': 'robust', 'aria-treeitem-name': 'robust',
};

const IMPACT_WEIGHTS: Record<string, number> = {
  critical: 25,
  serious: 10,
  moderate: 5,
  minor: 2,
};

const EFFORT_MAP: Record<string, 'easy' | 'medium' | 'hard'> = {
  'image-alt': 'easy', 'html-has-lang': 'easy', 'html-lang-valid': 'easy',
  'document-title': 'easy', 'link-name': 'easy', 'button-name': 'easy',
  'label': 'easy', 'heading-order': 'easy', 'landmark-one-main': 'easy',
  'color-contrast': 'medium', 'aria-required-attr': 'medium',
  'aria-valid-attr': 'medium', 'keyboard': 'hard', 'focus-trap': 'hard',
};

const AFFECTED_USERS_MAP: Record<string, string> = {
  critical: '~26% of users with disabilities',
  serious: '~18% of users with disabilities',
  moderate: '~12% of users with disabilities',
  minor: '~6% of users with disabilities',
};

const HISTORY_KEY = 'accesslens_scan_history';
const MAX_HISTORY = 20;

@Injectable({ providedIn: 'root' })
export class AccessibilityScoreService {

  /** Compute 0–100 score and letter grade from a scan result */
  computeScore(result: ScanResult): AccessibilityScore {
    const { violations, passes, incomplete } = result;
    const totalChecks = (passes?.length || 0) + (violations?.length || 0) + (incomplete?.length || 0);
    const breakdown = { critical: 0, serious: 0, moderate: 0, minor: 0 };

    let penalty = 0;
    for (const v of violations || []) {
      const impact = v.impact as string;
      const w = IMPACT_WEIGHTS[impact] || 2;
      penalty += w * Math.max(1, v.nodeCount || 1);
      if (impact === 'critical') breakdown.critical++;
      else if (impact === 'serious') breakdown.serious++;
      else if (impact === 'moderate') breakdown.moderate++;
      else if (impact === 'minor') breakdown.minor++;
    }

    const rawScore = Math.max(0, 100 - penalty);
    const score = Math.round(Math.min(100, rawScore));

    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    let gradeColor: string;
    if (score >= 90)      { grade = 'A'; gradeColor = '#10b981'; }
    else if (score >= 75) { grade = 'B'; gradeColor = '#3b82f6'; }
    else if (score >= 60) { grade = 'C'; gradeColor = '#f59e0b'; }
    else if (score >= 40) { grade = 'D'; gradeColor = '#ef4444'; }
    else                   { grade = 'F'; gradeColor = '#dc2626'; }

    return { score, grade, gradeColor, breakdown, totalChecks };
  }

  /** Breakdown pass/fail stats per WCAG principle */
  computeWcagBreakdown(result: ScanResult): WcagPrincipleBreakdown[] {
    const principles = [
      { key: 'perceivable',    label: 'Perceivable',    icon: '👁️'  },
      { key: 'operable',       label: 'Operable',       icon: '⌨️'  },
      { key: 'understandable', label: 'Understandable', icon: '🧠'  },
      { key: 'robust',         label: 'Robust',         icon: '🔧'  },
    ];

    return principles.map(p => {
      const passed = (result.passes || []).filter(v =>
        (RULE_PRINCIPLE_MAP[v.id] || 'robust') === p.key
      ).length;
      const failed = (result.violations || []).filter(v =>
        (RULE_PRINCIPLE_MAP[v.id] || 'robust') === p.key
      ).length;
      const total = passed + failed;
      const pct = total === 0 ? 100 : Math.round((passed / total) * 100);
      return { principle: p.key as any, label: p.label, icon: p.icon, passed, failed, total, pct };
    });
  }

  /** Compute a prioritised list of violations to fix first */
  computeRemediationRoadmap(result: ScanResult): RemediationItem[] {
    if (!result.violations?.length) return [];

    return result.violations
      .map(v => {
        const impact = v.impact as string || 'minor';
        const impactWeight = IMPACT_WEIGHTS[impact] || 2;
        const effort = EFFORT_MAP[v.id] || 'medium';
        const effortPenalty = effort === 'easy' ? 1 : effort === 'medium' ? 1.5 : 2.5;
        const nodeMultiplier = Math.min(v.nodeCount || 1, 10);
        const roiScore = Math.round((impactWeight * nodeMultiplier) / effortPenalty);

        const estimatedImpact: 'high' | 'medium' | 'low' =
          impactWeight >= 10 ? 'high' : impactWeight >= 5 ? 'medium' : 'low';

        const effortLabel = effort === 'easy' ? 'Quick fix (< 5 min)' :
                            effort === 'medium' ? 'Moderate effort' : 'Complex fix';

        return {
          rank: 0,
          violation: v,
          estimatedImpact,
          affectedUsers: AFFECTED_USERS_MAP[impact] || '~6% of users with disabilities',
          effort,
          effortLabel,
          roiScore,
        };
      })
      .sort((a, b) => b.roiScore - a.roiScore)
      .slice(0, 5)
      .map((item, i) => ({ ...item, rank: i + 1 }));
  }

  // ── Scan History (localStorage) ──────────────────────────────────────────

  saveToHistory(result: ScanResult, score: AccessibilityScore): void {
    const entry: ScanHistoryEntry = {
      id: result.id,
      url: result.url,
      timestamp: result.timestamp,
      score: score.score,
      grade: score.grade,
      violationCount: result.violationCount,
      passCount: result.passCount,
      incompleteCount: result.incompleteCount,
    };
    const history = this.getHistory();
    // Avoid duplicates
    const filtered = history.filter(h => h.id !== entry.id);
    filtered.unshift(entry);
    const trimmed = filtered.slice(0, MAX_HISTORY);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch { /* storage unavailable */ }
  }

  getHistory(): ScanHistoryEntry[] {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  getHistoryForUrl(url: string): ScanHistoryEntry[] {
    return this.getHistory().filter(h => h.url === url);
  }

  clearHistory(): void {
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
  }

  deleteHistoryEntry(id: string): void {
    const history = this.getHistory().filter(h => h.id !== id);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { /* ignore */ }
  }

  getPrincipleLabel(key: string): string {
    const map: Record<string, string> = {
      perceivable: 'Perceivable', operable: 'Operable',
      understandable: 'Understandable', robust: 'Robust',
    };
    return map[key] || key;
  }
}
