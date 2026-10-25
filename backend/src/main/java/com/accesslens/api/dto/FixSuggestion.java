package com.accesslens.api.dto;

public class FixSuggestion {
    private String ruleId;
    private String title;
    private String explanation;
    private String whyItMatters;
    private String before;
    private String after;
    private String wcagReference;
    private String[] verificationSteps;
    private String[] manualSteps;

    public FixSuggestion() {}

    public FixSuggestion(String ruleId, String title, String explanation, String whyItMatters,
                        String before, String after, String wcagReference,
                        String[] verificationSteps, String[] manualSteps) {
        this.ruleId = ruleId;
        this.title = title;
        this.explanation = explanation;
        this.whyItMatters = whyItMatters;
        this.before = before;
        this.after = after;
        this.wcagReference = wcagReference;
        this.verificationSteps = verificationSteps;
        this.manualSteps = manualSteps;
    }

    // Getters and setters
    public String getRuleId() { return ruleId; }
    public void setRuleId(String ruleId) { this.ruleId = ruleId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getWhyItMatters() { return whyItMatters; }
    public void setWhyItMatters(String whyItMatters) { this.whyItMatters = whyItMatters; }

    public String getBefore() { return before; }
    public void setBefore(String before) { this.before = before; }

    public String getAfter() { return after; }
    public void setAfter(String after) { this.after = after; }

    public String getWcagReference() { return wcagReference; }
    public void setWcagReference(String wcagReference) { this.wcagReference = wcagReference; }

    public String[] getVerificationSteps() { return verificationSteps; }
    public void setVerificationSteps(String[] verificationSteps) { this.verificationSteps = verificationSteps; }

    public String[] getManualSteps() { return manualSteps; }
    public void setManualSteps(String[] manualSteps) { this.manualSteps = manualSteps; }
}
