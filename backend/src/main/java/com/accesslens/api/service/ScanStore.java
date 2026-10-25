package com.accesslens.api.service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingDeque;

import org.springframework.stereotype.Component;

import com.accesslens.api.model.ScanResult;

@Component
public class ScanStore {
    private final ConcurrentHashMap<String, ScanResult> scans = new ConcurrentHashMap<>();
    private final LinkedBlockingDeque<String> recentScans = new LinkedBlockingDeque<>(100);

    public void store(ScanResult result) {
        boolean isNew = scans.putIfAbsent(result.getId(), result) == null;
        scans.put(result.getId(), result); // always update to latest state
        if (isNew) {
            recentScans.offerLast(result.getId());
        }
        // Keep only last 100 scans in memory
        if (scans.size() > 100) {
            String oldest = recentScans.pollFirst();
            if (oldest != null) {
                scans.remove(oldest);
            }
        }
    }

    public ScanResult getById(String id) {
        return scans.get(id);
    }

    public boolean exists(String id) {
        return scans.containsKey(id);
    }
}
