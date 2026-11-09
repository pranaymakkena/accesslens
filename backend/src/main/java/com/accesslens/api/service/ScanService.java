package com.accesslens.api.service;

import com.accesslens.api.graph.GraphAnalysisService;
import com.accesslens.api.model.ScanResult;
import com.accesslens.api.model.ScanStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class ScanService {
    private static final Logger logger = LoggerFactory.getLogger(ScanService.class);

    private final ScannerServiceClient scannerClient;
    private final ScanStore scanStore;
    private final GraphAnalysisService graphAnalysisService;

    public ScanService(ScannerServiceClient scannerClient, ScanStore scanStore,
                       GraphAnalysisService graphAnalysisService) {
        this.scannerClient = scannerClient;
        this.scanStore = scanStore;
        this.graphAnalysisService = graphAnalysisService;
    }

    public String startScan(String url) {
        String scanId = UUID.randomUUID().toString();
        ScanResult result = new ScanResult(scanId, url);
        result.setStatus(ScanStatus.PENDING);
        scanStore.store(result);

        CompletableFuture.runAsync(() -> performScan(scanId, url));

        logger.info("Scan {} initiated for URL: {}", scanId, url);
        return scanId;
    }

    private void performScan(String scanId, String url) {
        try {
            ScanResult result = scanStore.getById(scanId);
            if (result == null) return;

            result.setStatus(ScanStatus.SCANNING);
            scanStore.store(result);

            Mono<ScanResult> scanMono = scannerClient.scan(url);
            ScanResult scanResult = scanMono.block();

            if (scanResult != null) {
                scanResult.setId(scanId);
                scanResult.setUrl(url);
                scanResult.setTimestamp(Instant.now().toString());
                scanResult.setStatus(ScanStatus.COMPLETE);
                scanStore.store(scanResult);
                logger.info("Scan {} completed with {} violations", scanId, scanResult.getViolationCount());

                // Build Neo4j graph asynchronously (non-blocking for the poll response)
                CompletableFuture.runAsync(() -> {
                    try {
                        graphAnalysisService.buildGraphForScan(scanResult);
                    } catch (Exception e) {
                        logger.warn("Neo4j graph build failed for scan {} (non-fatal): {}", scanId, e.getMessage());
                    }
                });
            } else {
                result.setStatus(ScanStatus.FAILED);
                result.setError("Scanner returned no result");
                scanStore.store(result);
            }
        } catch (Exception e) {
            logger.error("Scan {} failed: {}", scanId, e.getMessage(), e);
            ScanResult result = scanStore.getById(scanId);
            if (result != null) {
                result.setStatus(ScanStatus.FAILED);
                result.setError("Scan failed: " + e.getMessage());
                scanStore.store(result);
            }
        }
    }

    public ScanResult getScanResult(String scanId) {
        return scanStore.getById(scanId);
    }
}
