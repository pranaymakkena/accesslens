package com.accesslens.api.graph;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Neo4jWcagPrincipleRepository extends Neo4jRepository<WcagPrincipleNode, String> {}
