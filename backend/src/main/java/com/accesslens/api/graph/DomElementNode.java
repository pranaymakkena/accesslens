package com.accesslens.api.graph;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents one DOM element captured during a scan.
 * Stored in Neo4j as a (:DomElement) node.
 *
 * Relationships:
 *   (parent)-[:CONTAINS]->(child)
 *   (element)-[:HAS_VIOLATION]->(violation)
 */
@Node("DomElement")
public class DomElementNode {

    @Id @GeneratedValue
    private Long id;

    /** Unique handle within a scan: "scanId::cssSelector" */
    private String elementId;

    /** CSS selector as reported by axe-core (e.g. "form > input[type=email]") */
    private String selector;

    /** The raw outer HTML snippet */
    private String html;

    /** HTML tag name (lower-case): div, input, img, button … */
    private String tag;

    /** id attribute value, if any */
    private String attrId;

    /** class attribute value, if any */
    private String attrClass;

    /** role attribute value, if any */
    private String role;

    /** Parent scan id — used to scope queries per scan */
    private String scanId;

    /**
     * Highest violation severity on this node:
     * "critical" | "serious" | "moderate" | "minor" | "none"
     */
    private String maxViolationSeverity = "none";

    /** true if this node carries aria-hidden="true" */
    private boolean ariaHidden;

    /** true if tabindex="-1" or similar focus blocking */
    private boolean focusBlocked;

    /** Whether this element is inside a Shadow DOM root */
    private boolean inShadowDom;

    @Relationship(type = "CONTAINS", direction = Relationship.Direction.OUTGOING)
    private List<DomElementNode> children = new ArrayList<>();

    @Relationship(type = "HAS_VIOLATION", direction = Relationship.Direction.OUTGOING)
    private List<GraphViolationNode> violations = new ArrayList<>();

    public DomElementNode() {}

    // ── Getters / Setters ────────────────────────────────────────────────

    public Long getId() { return id; }
    public String getElementId() { return elementId; }
    public void setElementId(String elementId) { this.elementId = elementId; }
    public String getSelector() { return selector; }
    public void setSelector(String selector) { this.selector = selector; }
    public String getHtml() { return html; }
    public void setHtml(String html) { this.html = html; }
    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }
    public String getAttrId() { return attrId; }
    public void setAttrId(String attrId) { this.attrId = attrId; }
    public String getAttrClass() { return attrClass; }
    public void setAttrClass(String attrClass) { this.attrClass = attrClass; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getScanId() { return scanId; }
    public void setScanId(String scanId) { this.scanId = scanId; }
    public String getMaxViolationSeverity() { return maxViolationSeverity; }
    public void setMaxViolationSeverity(String maxViolationSeverity) { this.maxViolationSeverity = maxViolationSeverity; }
    public boolean isAriaHidden() { return ariaHidden; }
    public void setAriaHidden(boolean ariaHidden) { this.ariaHidden = ariaHidden; }
    public boolean isFocusBlocked() { return focusBlocked; }
    public void setFocusBlocked(boolean focusBlocked) { this.focusBlocked = focusBlocked; }
    public boolean isInShadowDom() { return inShadowDom; }
    public void setInShadowDom(boolean inShadowDom) { this.inShadowDom = inShadowDom; }
    public List<DomElementNode> getChildren() { return children; }
    public void setChildren(List<DomElementNode> children) { this.children = children; }
    public List<GraphViolationNode> getViolations() { return violations; }
    public void setViolations(List<GraphViolationNode> violations) { this.violations = violations; }
}
