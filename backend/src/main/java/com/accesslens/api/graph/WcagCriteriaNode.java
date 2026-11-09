package com.accesslens.api.graph;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

/**
 * A static WCAG 2.1 Success Criterion seeded into Neo4j once on startup.
 *
 *   (:WcagCriteria)-[:PART_OF]->(:WcagGuideline)-[:PART_OF]->(:WcagPrinciple)
 */
@Node("WcagCriteria")
public class WcagCriteriaNode {

    /** WCAG SC id, e.g. "1.1.1" — used as the natural key */
    @Id
    private String criteriaId;

    private String name;          // "Non-text Content"
    private String level;         // A | AA | AAA
    private String principle;     // Perceivable | Operable | Understandable | Robust
    private String guideline;     // e.g. "Text Alternatives"
    private String description;
    private String url;           // link to W3C spec

    @Relationship(type = "PART_OF", direction = Relationship.Direction.OUTGOING)
    private WcagPrincipleNode principleNode;

    public WcagCriteriaNode() {}

    public WcagCriteriaNode(String criteriaId, String name, String level,
                             String principle, String guideline, String description, String url) {
        this.criteriaId = criteriaId;
        this.name = name;
        this.level = level;
        this.principle = principle;
        this.guideline = guideline;
        this.description = description;
        this.url = url;
    }

    // ── Getters / Setters ────────────────────────────────────────────────

    public String getCriteriaId() { return criteriaId; }
    public void setCriteriaId(String criteriaId) { this.criteriaId = criteriaId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getPrinciple() { return principle; }
    public void setPrinciple(String principle) { this.principle = principle; }
    public String getGuideline() { return guideline; }
    public void setGuideline(String guideline) { this.guideline = guideline; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public WcagPrincipleNode getPrincipleNode() { return principleNode; }
    public void setPrincipleNode(WcagPrincipleNode principleNode) { this.principleNode = principleNode; }
}
