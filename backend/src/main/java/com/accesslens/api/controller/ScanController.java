package com.accesslens.api.controller;

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

    public ScanController(ScanService scanService, FixSuggestionService fixSuggestionService) {
        this.scanService = scanService;
        this.fixSuggestionService = fixSuggestionService;
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
