package com.accesslens.api.controller;

import com.accesslens.api.graph.GraphAnalysisService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.accesslens.api.dto.ErrorResponse;
import com.accesslens.api.dto.ScanInitResponse;
import com.accesslens.api.dto.ScanRequest;
import com.accesslens.api.model.ScanResult;
import com.accesslens.api.service.FixSuggestionService;
import com.accesslens.api.service.ScanService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class ScanController {

    private final ScanService scanService;
    private final FixSuggestionService fixSuggestionService;
    private final GraphAnalysisService graphAnalysisService;

    public ScanController(ScanService scanService, FixSuggestionService fixSuggestionService,
                          GraphAnalysisService graphAnalysisService) {
        this.scanService = scanService;
        this.fixSuggestionService = fixSuggestionService;
        this.graphAnalysisService = graphAnalysisService;
    }

    @PostMapping("/scans")
    public ResponseEntity<?> startScan(@Valid @RequestBody ScanRequest request) {
        try {
            String scanId = scanService.startScan(request.getUrl());
            return ResponseEntity.accepted().body(new ScanInitResponse(scanId, "Scan initiated"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, "Invalid request", e.getMessage()));
        }
    }

    @GetMapping("/scans/{id}")
    public ResponseEntity<?> getScan(@PathVariable String id) {
        ScanResult result = scanService.getScanResult(id);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, "Not found", "Scan not found"));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/fixes/{ruleId}")
    public ResponseEntity<?> getFixSuggestion(@PathVariable String ruleId) {
        return fixSuggestionService.getFixForRule(ruleId)
            .map(fix -> ResponseEntity.ok((Object) fix))
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, "Not found", "Fix suggestion not available for rule: " + ruleId)));
    }

    @GetMapping("/demo")
    public ResponseEntity<ScanResult> getDemo() {
        // Create a demo result with intentional issues
        ScanResult demo = new ScanResult("demo-scan", "https://example.com/demo");
        demo.setStatus(com.accesslens.api.model.ScanStatus.COMPLETE);
        demo.setTimestamp(java.time.Instant.now().toString());
        
        // Add sample violations (from axe-core format)
        com.accesslens.api.model.Violation imageAlt = new com.accesslens.api.model.Violation();
        imageAlt.setId("image-alt");
        imageAlt.setDescription("Images must have alternate text");
        imageAlt.setImpact("critical");
        imageAlt.setHelp("Ensure that img elements have alternate text");
        imageAlt.setHelpUrl("https://dequeuniversity.com/rules/axe/4.9/image-alt");
        imageAlt.setTags(java.util.Arrays.asList("wcag2a", "wcag111"));
        
        com.accesslens.api.model.ViolationNode node = new com.accesslens.api.model.ViolationNode();
        node.setHtml("<img src=\"logo.png\">");
        node.setTarget(java.util.Arrays.asList("img:nth-child(1)"));
        node.setFailureSummary("Fix any of the following: Element does not have an alt attribute");
        imageAlt.setNodes(java.util.Arrays.asList(node));
        
        com.accesslens.api.model.Violation label = new com.accesslens.api.model.Violation();
        label.setId("label");
        label.setDescription("Form inputs must have associated labels");
        label.setImpact("critical");
        label.setHelp("Ensure form elements have associated labels");
        label.setHelpUrl("https://dequeuniversity.com/rules/axe/4.9/label");
        label.setTags(java.util.Arrays.asList("wcag2a", "wcag111"));
        
        node = new com.accesslens.api.model.ViolationNode();
        node.setHtml("<input type=\"email\" placeholder=\"Email\">");
        node.setTarget(java.util.Arrays.asList("form > input"));
        node.setFailureSummary("Fix any of the following: aria-label attribute does not exist or is empty");
        label.setNodes(java.util.Arrays.asList(node));
        
        demo.setViolations(java.util.Arrays.asList(imageAlt, label));
        demo.setViolationCount(2);
        demo.setPasses(java.util.Arrays.asList());
        demo.setIncomplete(java.util.Arrays.asList());
        demo.setPassCount(0);
        
        return ResponseEntity.ok(demo);
    }

    @GetMapping("/scans/{id}/report")
    public ResponseEntity<?> getReport(@PathVariable String id) {
        ScanResult result = scanService.getScanResult(id);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, "Not found", "Scan not found"));
        }
        
        String html = generateHtmlReport(result);
        return ResponseEntity.ok()
            .header("Content-Type", "text/html; charset=utf-8")
            .header("Content-Disposition", "attachment; filename=\"accessibility-report-" + id + ".html\"")
            .body(html);
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok().body("{\"status\":\"UP\"}");
    }

    // ── Neo4j Graph Endpoints ─────────────────────────────────────────────

    /**
     * Returns flat graph data (nodes + edges) for Cytoscape.js visualisation.
     * Each node has: nodeId, tag, selector, severity, ariaHidden, focusBlocked,
     * inShadowDom, violationRules.
     * Each edge is derived from the childIds list on each node.
     */
    @GetMapping("/scans/{id}/graph")
    public ResponseEntity<?> getDomGraph(@PathVariable String id) {
        ScanResult result = scanService.getScanResult(id);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, "Not found", "Scan not found"));
        }
        try {
            java.util.List<java.util.Map<String, Object>> nodes = graphAnalysisService.getGraphData(id);
            // Convert to Cytoscape.js element format
            java.util.List<java.util.Map<String, Object>> elements = toCytoscapeElements(nodes);
            return ResponseEntity.ok(java.util.Map.of("elements", elements, "nodeCount", nodes.size()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponse(503, "Graph unavailable",
                    "Neo4j graph data not yet available — scan may still be processing."));
        }
    }

    /**
     * Cascading Impact Analysis: returns "root cause components" — ancestor
     * elements whose subtree contains the most violations.
     */
    @GetMapping("/scans/{id}/graph/root-causes")
    public ResponseEntity<?> getRootCauses(@PathVariable String id) {
        ScanResult result = scanService.getScanResult(id);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, "Not found", "Scan not found"));
        }
        try {
            return ResponseEntity.ok(graphAnalysisService.getRootCauseComponents(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponse(503, "Graph unavailable", "Neo4j graph not yet available."));
        }
    }

    /**
     * Returns elements that are invisible to assistive technology because they
     * sit inside an aria-hidden ancestor (the "aria-hidden cascade" problem).
     */
    @GetMapping("/scans/{id}/graph/aria-hidden-cascades")
    public ResponseEntity<?> getAriaHiddenCascades(@PathVariable String id) {
        ScanResult result = scanService.getScanResult(id);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, "Not found", "Scan not found"));
        }
        try {
            return ResponseEntity.ok(graphAnalysisService.getAriaHiddenCascades(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponse(503, "Graph unavailable", "Neo4j graph not yet available."));
        }
    }

    /**
     * Graph-based WCAG roadmap: returns violated WCAG criteria ranked by
     * severity, connected to the live violation graph.
     */
    @GetMapping("/scans/{id}/graph/wcag-roadmap")
    public ResponseEntity<?> getWcagGraphRoadmap(@PathVariable String id) {
        ScanResult result = scanService.getScanResult(id);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, "Not found", "Scan not found"));
        }
        try {
            return ResponseEntity.ok(graphAnalysisService.getWcagRoadmap(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponse(503, "Graph unavailable", "Neo4j graph not yet available."));
        }
    }

    // ── Helper: convert flat Neo4j rows to Cytoscape.js elements ──────────

    @SuppressWarnings("unchecked")
    private java.util.List<java.util.Map<String, Object>> toCytoscapeElements(
            java.util.List<java.util.Map<String, Object>> rows) {
        java.util.List<java.util.Map<String, Object>> elements = new java.util.ArrayList<>();
        for (java.util.Map<String, Object> row : rows) {
            String nodeId = String.valueOf(row.get("nodeId"));
            // Node element
            java.util.Map<String, Object> data = new java.util.LinkedHashMap<>();
            data.put("id", nodeId);
            data.put("tag", row.get("tag"));
            data.put("selector", row.get("selector"));
            data.put("severity", row.getOrDefault("severity", "none"));
            data.put("ariaHidden", row.getOrDefault("ariaHidden", false));
            data.put("focusBlocked", row.getOrDefault("focusBlocked", false));
            data.put("inShadowDom", row.getOrDefault("inShadowDom", false));
            data.put("violationRules", row.getOrDefault("violationRules", java.util.List.of()));
            data.put("label", row.getOrDefault("tag", "?") + (row.get("selector") != null
                ? "\n" + abbreviate(String.valueOf(row.get("selector")), 30) : ""));
            elements.add(java.util.Map.of("data", data));

            // Edge elements
            Object childIds = row.get("childIds");
            if (childIds instanceof java.util.List) {
                for (Object childId : (java.util.List<?>) childIds) {
                    if (childId == null || String.valueOf(childId).isBlank()) continue;
                    java.util.Map<String, Object> edge = new java.util.LinkedHashMap<>();
                    edge.put("id", "e_" + nodeId + "_" + childId);
                    edge.put("source", nodeId);
                    edge.put("target", String.valueOf(childId));
                    edge.put("label", "CONTAINS");
                    elements.add(java.util.Map.of("data", edge));
                }
            }
        }
        return elements;
    }

    private String abbreviate(String s, int max) {
        return s.length() <= max ? s : "…" + s.substring(s.length() - max + 1);
    }

    @GetMapping("/scans/{id}/score")
    public ResponseEntity<?> getScore(@PathVariable String id) {
        ScanResult result = scanService.getScanResult(id);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, "Not found", "Scan not found"));
        }
        int critical = 0, serious = 0, moderate = 0, minor = 0;
        int penalty = 0;
        if (result.getViolations() != null) {
            for (com.accesslens.api.model.Violation v : result.getViolations()) {
                String impact = v.getImpact() != null ? v.getImpact() : "minor";
                int nodes = v.getNodeCount() > 0 ? v.getNodeCount() : 1;
                int w;
                switch (impact) {
                    case "critical": w = 25; critical++; break;
                    case "serious":  w = 10; serious++;  break;
                    case "moderate": w =  5; moderate++; break;
                    default:         w =  2; minor++;    break;
                }
                penalty += w * Math.min(nodes, 10);
            }
        }
        int score = Math.max(0, Math.min(100, 100 - penalty));
        String grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";
        java.util.Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("score", score);
        body.put("grade", grade);
        body.put("critical", critical);
        body.put("serious", serious);
        body.put("moderate", moderate);
        body.put("minor", minor);
        body.put("totalViolations", result.getViolationCount());
        body.put("totalPassed", result.getPassCount());
        return ResponseEntity.ok(body);
    }

    private String generateHtmlReport(ScanResult result) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html>\n");
        sb.append("<html lang=\"en\">\n");
        sb.append("<head>\n");
        sb.append("  <meta charset=\"UTF-8\">\n");
        sb.append("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
        sb.append("  <title>AccessLens Report - ").append(escapeHtml(result.getUrl())).append("</title>\n");
        sb.append("  <style>\n");
        sb.append("    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }\n");
        sb.append("    .container { max-width: 1000px; margin: 0 auto; padding: 2rem; }\n");
        sb.append("    h1 { color: #2c3e50; }\n");
        sb.append("    .summary { display: flex; gap: 1.5rem; margin: 1.5rem 0; }\n");
        sb.append("    .stat { background: #f5f5f5; padding: 1rem; border-radius: 8px; flex: 1; text-align: center; }\n");
        sb.append("    .violations-list { margin: 1.5rem 0; }\n");
        sb.append("    .violation { background: #fff3cd; border-left: 4px solid #ff9800; padding: 1rem; margin: 0.5rem 0; border-radius: 4px; }\n");
        sb.append("    .violation-critical { background: #f8d7da; border-left-color: #dc3545; }\n");
        sb.append("    code { background: #f5f5f5; padding: 0.2rem 0.5rem; border-radius: 3px; }\n");
        sb.append("    .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; font-size: 0.9rem; color: #666; }\n");
        sb.append("  </style>\n");
        sb.append("</head>\n");
        sb.append("<body>\n");
        sb.append("  <div class=\"container\">\n");
        sb.append("    <h1>🔍 AccessLens Accessibility Report</h1>\n");
        sb.append("    <p><strong>URL:</strong> ").append(escapeHtml(result.getUrl())).append("</p>\n");
        sb.append("    <p><strong>Scan Date:</strong> ").append(result.getTimestamp()).append("</p>\n");
        
        sb.append("    <div class=\"summary\">\n");
        sb.append("      <div class=\"stat\"><div>").append(result.getViolationCount()).append("</div><div>Violations</div></div>\n");
        sb.append("      <div class=\"stat\"><div>").append(result.getPassCount()).append("</div><div>Passed</div></div>\n");
        sb.append("      <div class=\"stat\"><div>").append(result.getIncompleteCount()).append("</div><div>Needs Review</div></div>\n");
        sb.append("    </div>\n");
        
        if (result.getViolations() != null && !result.getViolations().isEmpty()) {
            sb.append("    <div class=\"violations-list\">\n");
            sb.append("      <h2>Issues Found</h2>\n");
            for (com.accesslens.api.model.Violation v : result.getViolations()) {
                String cls = "critical".equals(v.getImpact()) ? " violation-critical" : "";
                sb.append("      <div class=\"violation").append(cls).append("\">\n");
                sb.append("        <strong>[").append(v.getImpact().toUpperCase()).append("] ").append(v.getDescription()).append("</strong>\n");
                sb.append("        <p>").append(v.getHelp()).append("</p>\n");
                if (v.getNodes() != null && !v.getNodes().isEmpty()) {
                    sb.append("        <p><em>Affected elements:</em></p><pre><code>").append(escapeHtml(v.getNodes().get(0).getHtml())).append("</code></pre>\n");
                }
                sb.append("      </div>\n");
            }
            sb.append("    </div>\n");
        }
        
        sb.append("    <div class=\"footer\">\n");
        sb.append("      <p><strong>Important:</strong> Automated scanning detects only a subset of accessibility issues (~30-40% of WCAG criteria). Full compliance requires manual testing with assistive technologies.</p>\n");
        sb.append("      <p>Generated by <a href=\"https://github.com/PLACEHOLDER/accesslens\">AccessLens</a></p>\n");
        sb.append("    </div>\n");
        sb.append("  </div>\n");
        sb.append("</body>\n");
        sb.append("</html>\n");
        return sb.toString();
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }
}
