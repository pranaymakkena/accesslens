package com.accesslens.api.graph;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

/**
 * One of the four top-level WCAG 2.1 principles (static seed data).
 */
@Node("WcagPrinciple")
public class WcagPrincipleNode {

    @Id
    private String principleId;   // "P1" … "P4"

    private String name;          // Perceivable | Operable | Understandable | Robust
    private String icon;

    public WcagPrincipleNode() {}

    public WcagPrincipleNode(String principleId, String name, String icon) {
        this.principleId = principleId;
        this.name = name;
        this.icon = icon;
    }

    public String getPrincipleId() { return principleId; }
    public void setPrincipleId(String principleId) { this.principleId = principleId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
