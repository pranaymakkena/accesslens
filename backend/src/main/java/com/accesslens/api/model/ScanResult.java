package com.accesslens.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ScanResult {
    private String id;
    private String url;
    private ScanStatus status;
    private String timestamp;
    private List<Violation> violations = new ArrayList<>();
    private List<Violation> passes = new ArrayList<>();
    private List<Violation> incomplete = new ArrayList<>();
    private List<Violation> inapplicable = new ArrayList<>();
    private int violationCount;
    private int passCount;
    private int incompleteCount;
    private String error;

    public ScanResult() {}

    public ScanResult(String id, String url) {
        this.id = id;
        this.url = url;
        this.status = ScanStatus.PENDING;
        this.timestamp = Instant.now().toString();
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public ScanStatus getStatus() { return status; }
    public void setStatus(ScanStatus status) { this.status = status; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public List<Violation> getViolations() { return violations; }
    public void setViolations(List<Violation> violations) {
        this.violations = violations != null ? violations : new ArrayList<>();
        this.violationCount = this.violations.size();
    }

    public List<Violation> getPasses() { return passes; }
    public void setPasses(List<Violation> passes) {
        this.passes = passes != null ? passes : new ArrayList<>();
        this.passCount = this.passes.size();
    }

    public List<Violation> getIncomplete() { return incomplete; }
    public void setIncomplete(List<Violation> incomplete) {
        this.incomplete = incomplete != null ? incomplete : new ArrayList<>();
        this.incompleteCount = this.incomplete.size();
    }

    public List<Violation> getInapplicable() { return inapplicable; }
    public void setInapplicable(List<Violation> inapplicable) {
        this.inapplicable = inapplicable != null ? inapplicable : new ArrayList<>();
    }

    public int getViolationCount() { return violationCount; }
    public void setViolationCount(int violationCount) { this.violationCount = violationCount; }

    public int getPassCount() { return passCount; }
    public void setPassCount(int passCount) { this.passCount = passCount; }

    public int getIncompleteCount() { return incompleteCount; }
    public void setIncompleteCount(int incompleteCount) { this.incompleteCount = incompleteCount; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}
