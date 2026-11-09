package com.accesslens.api.graph;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface WcagCriteriaRepository extends Neo4jRepository<WcagCriteriaNode, String> {

    Optional<WcagCriteriaNode> findByCriteriaId(String criteriaId);

    /**
     * Graph-based WCAG roadmap: for a given scan, return every WCAG criterion
     * that is violated, with a count of how many elements fail it and all the
     * rule IDs that map to it.  Sorted by severity then violation count.
     */
    @Query("""
        MATCH (v:GraphViolation {scanId: $scanId})-[:VIOLATES]->(sc:WcagCriteria)
        WITH sc, count(v) AS violationCount, collect(DISTINCT v.ruleId) AS ruleIds,
             collect(DISTINCT v.severity) AS severities
        RETURN sc.criteriaId   AS criteriaId,
               sc.name         AS name,
               sc.level        AS level,
               sc.principle    AS principle,
               sc.guideline    AS guideline,
               sc.url          AS url,
               violationCount  AS violationCount,
               ruleIds         AS ruleIds,
               severities      AS severities
        ORDER BY
          CASE WHEN 'critical' IN severities THEN 0
               WHEN 'serious'  IN severities THEN 1
               WHEN 'moderate' IN severities THEN 2
               ELSE 3 END,
          violationCount DESC
        """)
    List<Map<String, Object>> getViolatedCriteriaForScan(@Param("scanId") String scanId);
}
