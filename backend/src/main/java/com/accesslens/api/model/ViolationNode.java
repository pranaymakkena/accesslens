package com.accesslens.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ViolationNode {
    private String html;
    private List<String> target;
    private String failureSummary;

    public ViolationNode() {}

    public String getHtml() { return html; }
    public void setHtml(String html) { this.html = html; }

    public List<String> getTarget() { return target; }
    public void setTarget(List<String> target) { this.target = target; }

    public String getFailureSummary() { return failureSummary; }
    public void setFailureSummary(String failureSummary) { this.failureSummary = failureSummary; }
}
