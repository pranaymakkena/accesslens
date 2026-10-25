package com.accesslens.api.service;

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

    public ScanService(ScannerServiceClient scannerClient, ScanStore scanStore) {
        this.scannerClient = scannerClient;
        this.scanStore = scanStore;
    }

    public String startScan(String url) {
        String scanId = UUID.randomUUID().toString();
        ScanResult result = new ScanResult(scanId, url);
        result.setStatus(ScanStatus.PENDING);
        scanStore.store(result);

        // Run scan asynchronously
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

            // Call scanner service
            Mono<ScanResult> scanMono = scannerClient.scan(url);
            ScanResult scanResult = scanMono.block(); // Block to complete async call

            if (scanResult != null) {
                scanResult.setId(scanId);
                scanResult.setUrl(url);
                scanResult.setTimestamp(Instant.now().toString());
                scanResult.setStatus(ScanStatus.COMPLETE);
                scanStore.store(scanResult);
                logger.info("Scan {} completed with {} violations", scanId, scanResult.getViolationCount());
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
