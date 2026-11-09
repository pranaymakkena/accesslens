package com.accesslens.api.graph;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

/**
 * A violation instance node in Neo4j.
 * Connected to:
 *   (:DomElement)-[:HAS_VIOLATION]->(:GraphViolation)
 *   (:GraphViolation)-[:VIOLATES]->(:WcagCriteria)
 */
@Node("GraphViolation")
public class GraphViolationNode {

    @Id @GeneratedValue
    private Long id;

    /** axe-core rule id: "image-alt", "color-contrast", … */
    private String ruleId;

    private String description;
    private String severity;   // critical | serious | moderate | minor
    private String scanId;
    private String failureSummary;

    @Relationship(type = "VIOLATES", direction = Relationship.Direction.OUTGOING)
    private WcagCriteriaNode wcagCriteria;

    public GraphViolationNode() {}

    // ── Getters / Setters ────────────────────────────────────────────────

    public Long getId() { return id; }
    public String getRuleId() { return ruleId; }
    public void setRuleId(String ruleId) { this.ruleId = ruleId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getScanId() { return scanId; }
    public void setScanId(String scanId) { this.scanId = scanId; }
    public String getFailureSummary() { return failureSummary; }
    public void setFailureSummary(String failureSummary) { this.failureSummary = failureSummary; }
    public WcagCriteriaNode getWcagCriteria() { return wcagCriteria; }
    public void setWcagCriteria(WcagCriteriaNode wcagCriteria) { this.wcagCriteria = wcagCriteria; }
}
