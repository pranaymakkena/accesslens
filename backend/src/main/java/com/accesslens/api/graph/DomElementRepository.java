package com.accesslens.api.graph;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface DomElementRepository extends Neo4jRepository<DomElementNode, Long> {

    List<DomElementNode> findByScanId(String scanId);

    /** Delete all DOM elements (and their relationships) for a given scan. */
    @Query("MATCH (e:DomElement {scanId: $scanId}) DETACH DELETE e")
    void deleteByScanId(@Param("scanId") String scanId);

    /**
     * Root-cause analysis: find ancestor elements whose subtree contains
     * more than one unique violation rule. Returns a ranked list of
     * (element, descendant-violation-count) pairs.
     *
     * This is the core "Cascading Impact Analysis" query.
     */
    @Query("""
        MATCH (ancestor:DomElement {scanId: $scanId})
        MATCH (ancestor)-[:CONTAINS*1..]->(desc:DomElement)-[:HAS_VIOLATION]->(v:GraphViolation)
        WITH ancestor, count(DISTINCT v.ruleId) AS distinctRules, count(v) AS totalViolations,
             collect(DISTINCT v.ruleId) AS affectedRules,
             collect(DISTINCT v.severity) AS severities
        WHERE distinctRules > 1
        RETURN ancestor.elementId      AS elementId,
               ancestor.selector       AS selector,
               ancestor.tag            AS tag,
               ancestor.html           AS html,
               ancestor.attrId         AS attrId,
               ancestor.attrClass      AS attrClass,
               distinctRules           AS distinctRules,
               totalViolations         AS totalViolations,
               affectedRules           AS affectedRules,
               severities              AS severities
        ORDER BY totalViolations DESC
        LIMIT 10
        """)
    List<Map<String, Object>> findRootCauseComponents(@Param("scanId") String scanId);

    /**
     * Find all elements that are "blocked" by an aria-hidden ancestor:
     * they are focusable but hidden from the accessibility tree.
     */
    @Query("""
        MATCH (hidden:DomElement {scanId: $scanId, ariaHidden: true})
        MATCH (hidden)-[:CONTAINS*1..]->(child:DomElement)
        WHERE NOT child.tag IN ['br','hr','img','area','base','col','embed','input','link','meta','param','source','track','wbr']
        RETURN hidden.selector AS hiddenAncestor,
               collect(DISTINCT child.selector) AS blockedDescendants,
               count(child) AS blockedCount
        ORDER BY blockedCount DESC
        LIMIT 5
        """)
    List<Map<String, Object>> findAriaHiddenCascades(@Param("scanId") String scanId);

    /**
     * Flat graph data for the frontend visualiser — returns all nodes and
     * CONTAINS edges for a scan so Cytoscape.js can render it.
     */
    @Query("""
        MATCH (e:DomElement {scanId: $scanId})
        OPTIONAL MATCH (e)-[:HAS_VIOLATION]->(v:GraphViolation)
        OPTIONAL MATCH (e)-[:CONTAINS]->(child:DomElement {scanId: $scanId})
        RETURN e.elementId        AS nodeId,
               e.tag              AS tag,
               e.selector         AS selector,
               e.html             AS html,
               e.maxViolationSeverity AS severity,
               e.ariaHidden       AS ariaHidden,
               e.focusBlocked     AS focusBlocked,
               e.inShadowDom      AS inShadowDom,
               collect(DISTINCT child.elementId) AS childIds,
               collect(DISTINCT v.ruleId)        AS violationRules
        """)
    List<Map<String, Object>> getGraphDataForScan(@Param("scanId") String scanId);
}
