package com.accesslens.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import com.accesslens.api.model.ScanResult;
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Mono;

@Service
public class ScannerServiceClient {
    private static final Logger logger = LoggerFactory.getLogger(ScannerServiceClient.class);

    private final WebClient webClient;
    private final String scannerUrl;
    private final ObjectMapper objectMapper;
    
    // 10MB buffer limit instead of default 256KB
    private static final int MAX_BUFFER_SIZE = 10 * 1024 * 1024;

    public ScannerServiceClient(
        WebClient.Builder webClientBuilder,
        @Value("${accesslens.scanner.url:http://localhost:3001}") String scannerUrl,
        ObjectMapper objectMapper
    ) {
        this.scannerUrl = scannerUrl;
        
        // Configure ExchangeStrategies with larger buffer
        ExchangeStrategies strategies = ExchangeStrategies.builder()
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(MAX_BUFFER_SIZE))
            .build();
        
        this.webClient = webClientBuilder
            .exchangeStrategies(strategies)
            .build();
        this.objectMapper = objectMapper;
    }

    public Mono<ScanResult> scan(String url) {
        logger.info("Requesting scan for URL: {}", url);
        try {
            String body = objectMapper.writeValueAsString(java.util.Map.of("url", url));
            return webClient
                .post()
                .uri(scannerUrl + "/scan")
                .bodyValue(body)
                .header("Content-Type", "application/json")
                .retrieve()
                .bodyToMono(ScanResult.class)
                .doOnError(e -> logger.error("Scanner service error: {}", e.getMessage()));
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            logger.error("Failed to serialize scan request: {}", e.getMessage());
            return Mono.error(e);
        }
    }
}
