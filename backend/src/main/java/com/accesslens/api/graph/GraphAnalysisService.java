package com.accesslens.api.graph;

import com.accesslens.api.model.ScanResult;
import com.accesslens.api.model.Violation;
import com.accesslens.api.model.ViolationNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Builds a Neo4j DOM graph from a completed scan result, then exposes
 * graph-query methods for cascading impact analysis, aria-hidden cascade
 * detection, and the interactive dependency graph.
 *
 * DOM hierarchy inference:
 *   axe-core reports CSS selectors like "form > input[type=email]".
 *   We parse the selector chain to reconstruct parent→child CONTAINS edges
 *   without needing the full HTML document tree.
 */
@Service
public class GraphAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(GraphAnalysisService.class);

    // Maps axe-core rule IDs to WCAG criteria IDs (same mapping as frontend)
    private static final Map<String, String> RULE_TO_WCAG = Map.ofEntries(
        Map.entry("image-alt",            "1.1.1"),
        Map.entry("input-image-alt",      "1.1.1"),
        Map.entry("object-alt",           "1.1.1"),
        Map.entry("svg-img-alt",          "1.1.1"),
        Map.entry("color-contrast",       "1.4.3"),
        Map.entry("color-contrast-enhanced", "1.4.6"),
        Map.entry("meta-viewport",        "1.4.4"),
        Map.entry("label",                "3.3.2"),
        Map.entry("select-name",          "3.3.2"),
        Map.entry("autocomplete-valid",   "1.3.5"),
        Map.entry("html-has-lang",        "3.1.1"),
        Map.entry("html-lang-valid",      "3.1.1"),
        Map.entry("document-title",       "2.4.2"),
        Map.entry("link-name",            "2.4.4"),
        Map.entry("button-name",          "4.1.2"),
        Map.entry("heading-order",        "1.3.1"),
        Map.entry("landmark-one-main",    "1.3.1"),
        Map.entry("bypass",               "2.4.1"),
        Map.entry("skip-link",            "2.4.1"),
        Map.entry("frame-title",          "2.4.1"),
        Map.entry("tabindex",             "2.4.3"),
        Map.entry("focus-visible",        "2.4.11"),
        Map.entry("scrollable-region-focusable", "2.1.1"),
        Map.entry("keyboard",             "2.1.1"),
        Map.entry("duplicate-id",         "4.1.1"),
        Map.entry("duplicate-id-aria",    "4.1.1"),
        Map.entry("aria-required-attr",   "4.1.2"),
        Map.entry("aria-valid-attr",      "4.1.2"),
        Map.entry("aria-valid-attr-value","4.1.2"),
        Map.entry("aria-roles",           "4.1.2"),
        Map.entry("aria-hidden-focus",    "4.1.2")
    );

    private final DomElementRepository domRepo;
    private final WcagCriteriaRepository wcagRepo;

    public GraphAnalysisService(DomElementRepository domRepo, WcagCriteriaRepository wcagRepo) {
        this.domRepo = domRepo;
        this.wcagRepo = wcagRepo;
    }

    // ── Build graph ───────────────────────────────────────────────────────

    /**
     * Parses the scan result, constructs DomElementNode / GraphViolationNode
     * objects, infers parent-child edges from CSS selector chains, links
     * violations to WCAG criteria, and saves everything to Neo4j.
     */
    public void buildGraphForScan(ScanResult result) {
        if (result == null || result.getViolations() == null) return;

        String scanId = result.getId();
        log.info("Building Neo4j DOM graph for scan {}", scanId);

        // Clean up any previous graph for this scan (re-scan support)
        domRepo.deleteByScanId(scanId);

        // Index: elementId → node (so we can deduplicate shared selectors)
        Map<String, DomElementNode> elementMap = new LinkedHashMap<>();

        for (Violation v : result.getViolations()) {
            if (v.getNodes() == null) continue;
            for (ViolationNode vn : v.getNodes()) {
                List<String> targets = vn.getTarget();
                if (targets == null || targets.isEmpty()) continue;

                // Build the ancestor chain from the selector
                String fullSelector = targets.get(0);
                List<String> selectorChain = parseSelectorChain(fullSelector);

                DomElementNode parent = null;
                for (int i = 0; i < selectorChain.size(); i++) {
                    String sel = selectorChain.get(i);
                    String elemId = scanId + "::" + sel;

                    DomElementNode node = elementMap.computeIfAbsent(elemId, id -> {
                        DomElementNode n = new DomElementNode();
                        n.setElementId(id);
                        n.setScanId(scanId);
                        n.setSelector(sel);
                        n.setHtml(vn.getHtml());
                        n.setTag(extractTag(sel));
                        n.setAttrId(extractAttr(sel, "id"));
                        n.setAttrClass(extractAttr(sel, "class"));
                        n.setRole(extractAttr(sel, "role"));
                        n.setAriaHidden(sel.contains("aria-hidden") || htmlContains(vn.getHtml(), "aria-hidden=\"true\""));
                        n.setFocusBlocked(sel.contains("tabindex=\"-1\"") || htmlContains(vn.getHtml(), "tabindex=\"-1\""));
                        n.setInShadowDom(sel.contains(">>"));
                        return n;
                    });

                    // Wire CONTAINS edge
                    if (parent != null && !parent.getChildren().contains(node)) {
                        parent.getChildren().add(node);
                    }
                    parent = node;
                }

                // The leaf node carries the actual violation
                if (parent != null) {
                    String severity = v.getImpact() != null ? v.getImpact() : "minor";
                    updateMaxSeverity(parent, severity);

                    GraphViolationNode gv = new GraphViolationNode();
                    gv.setRuleId(v.getId());
                    gv.setDescription(v.getDescription());
                    gv.setSeverity(severity);
                    gv.setScanId(scanId);
                    gv.setFailureSummary(vn.getFailureSummary());

                    // Link to WCAG criteria
                    String wcagId = RULE_TO_WCAG.get(v.getId());
                    if (wcagId != null) {
                        wcagRepo.findByCriteriaId(wcagId)
                                .ifPresent(gv::setWcagCriteria);
                    }

                    parent.getViolations().add(gv);
                }
            }
        }

        // Save root elements (children are cascaded by SDN)
        List<DomElementNode> roots = elementMap.values().stream()
            .filter(e -> isRoot(e, elementMap))
            .collect(Collectors.toList());

        domRepo.saveAll(roots);
        log.info("Saved {} DOM nodes to Neo4j for scan {}", elementMap.size(), scanId);
    }

    // ── Query methods ──────────────────────────────────────────────────────

    public List<Map<String, Object>> getRootCauseComponents(String scanId) {
        return domRepo.findRootCauseComponents(scanId);
    }

    public List<Map<String, Object>> getAriaHiddenCascades(String scanId) {
        return domRepo.findAriaHiddenCascades(scanId);
    }

    public List<Map<String, Object>> getGraphData(String scanId) {
        return domRepo.getGraphDataForScan(scanId);
    }

    public List<Map<String, Object>> getWcagRoadmap(String scanId) {
        return wcagRepo.getViolatedCriteriaForScan(scanId);
    }

    // ── Private helpers ────────────────────────────────────────────────────

    /**
     * Split a CSS selector chain into individual steps.
     * "html > body > main > form > input" → ["html", "html > body", …]
     * We accumulate each step so each entry represents the full path to that ancestor.
     */
    private List<String> parseSelectorChain(String fullSelector) {
        String[] parts = fullSelector.split("\\s*>\\s*|\\s+");
        List<String> chain = new ArrayList<>();
        StringBuilder acc = new StringBuilder();
        for (String part : parts) {
            if (part.isBlank()) continue;
            if (acc.length() > 0) acc.append(" > ");
            acc.append(part.trim());
            chain.add(acc.toString());
        }
        return chain.isEmpty() ? List.of(fullSelector) : chain;
    }

    private String extractTag(String selector) {
        // Take the last segment of the selector and pull the tag name
        String last = selector.contains(">") ?
            selector.substring(selector.lastIndexOf(">") + 1).trim() : selector;
        // Strip pseudo-classes, attribute selectors, id/class
        return last.replaceAll("[#.\\[:\\s].*", "").toLowerCase();
    }

    private String extractAttr(String selector, String attr) {
        if (attr.equals("id") && selector.contains("#")) {
            String s = selector.substring(selector.indexOf('#') + 1);
            return s.replaceAll("[.\\[:\\s].*", "");
        }
        if (attr.equals("class") && selector.contains(".")) {
            String s = selector.substring(selector.indexOf('.') + 1);
            return s.replaceAll("[#\\[:\\s].*", "");
        }
        String search = attr + "=\"";
        if (selector.contains(search)) {
            int start = selector.indexOf(search) + search.length();
            int end = selector.indexOf('"', start);
            if (end > start) return selector.substring(start, end);
        }
        return null;
    }

    private boolean htmlContains(String html, String fragment) {
        return html != null && html.contains(fragment);
    }

    private void updateMaxSeverity(DomElementNode node, String newSeverity) {
        int current = severityRank(node.getMaxViolationSeverity());
        int incoming = severityRank(newSeverity);
        if (incoming > current) node.setMaxViolationSeverity(newSeverity);
    }

    private int severityRank(String s) {
        return switch (s) {
            case "critical" -> 4;
            case "serious"  -> 3;
            case "moderate" -> 2;
            case "minor"    -> 1;
            default         -> 0;
        };
    }

    private boolean isRoot(DomElementNode candidate, Map<String, DomElementNode> all) {
        String sel = candidate.getSelector();
        // A node is a root if no other node's selector is a prefix of it
        for (DomElementNode other : all.values()) {
            if (other == candidate) continue;
            if (sel.startsWith(other.getSelector() + " > ")) return false;
        }
        return true;
    }
}
