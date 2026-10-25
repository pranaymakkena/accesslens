package com.accesslens.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Violation {
    private String id;
    private String description;
    private String impact;
    private String help;
    private String helpUrl;
    private List<String> tags;
    private List<ViolationNode> nodes;
    private int nodeCount;

    public Violation() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImpact() { return impact; }
    public void setImpact(String impact) { this.impact = impact; }

    public String getHelp() { return help; }
    public void setHelp(String help) { this.help = help; }

    public String getHelpUrl() { return helpUrl; }
    public void setHelpUrl(String helpUrl) { this.helpUrl = helpUrl; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public List<ViolationNode> getNodes() { return nodes; }
    public void setNodes(List<ViolationNode> nodes) {
        this.nodes = nodes;
        this.nodeCount = (nodes != null) ? nodes.size() : 0;
    }

    public int getNodeCount() { return nodeCount; }
    public void setNodeCount(int nodeCount) { this.nodeCount = nodeCount; }
}
