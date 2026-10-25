const express = require('express');
const { chromium } = require('playwright');
const { isValidUrl, validateSSFR } = require('./url-validator');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10kb' }));

let activeBrowsers = 0;
const MAX_CONCURRENT_SCANS = 3;

// Middleware to check concurrency limit
app.use((req, res, next) => {
  if (activeBrowsers >= MAX_CONCURRENT_SCANS) {
    return res.status(429).json({ error: 'Too many concurrent scans. Please wait.' });
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', version: '1.0.0' });
});

// Main scan endpoint
app.post('/scan', async (req, res) => {
  const { url } = req.body;

  // Validate input
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Check SSRF
  const ssfrError = await validateSSFR(url);
  if (ssfrError) {
    return res.status(403).json({ error: ssfrError });
  }

  // Increment active browser count
  activeBrowsers++;

  try {
    const results = await runAccessibilityScan(url);
    res.json(results);
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      error: 'Scan failed',
      message: error.message.substring(0, 200)
    });
  } finally {
    activeBrowsers--;
  }
});

// Demo page endpoint (for tests without external URL)
app.get('/demo-page', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <!-- Missing: lang attribute on html -->
  <!-- Missing: title element -->
</head>
<body>
  <!-- Missing: alt text on image -->
  <img src="logo.png" style="width: 100px;">

  <!-- Missing: form labels -->
  <form>
    <input type="email" placeholder="Email">
    <input type="password" placeholder="Password">
    <button type="submit">Login</button>
  </form>

  <!-- Missing: main landmark -->
  <h3>Services</h3>
  <p>We offer professional services.</p>

  <!-- Heading order issue -->
  <h1>Welcome</h1>
  <h3>Our Team</h3>
</body>
</html>`);
});

async function runAccessibilityScan(url) {
  let browser = null;
  let page = null;

  try {
    const startTime = Date.now();

    // Launch browser with security settings
    browser = await chromium.launch({
      headless: true,
      // Run in a restricted environment
      args: ['--disable-dev-shm-usage', '--no-sandbox']
    });

    page = await browser.newPage();

    // Set timeouts
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    // Navigate to URL with timeout
    await Promise.race([
      page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Navigation timeout')), 30000))
    ]);

    // Inject and run axe-core (using local package to avoid CDN/CSP issues)
    const axePath = require.resolve('axe-core');
    await page.addScriptTag({ path: axePath });

    const results = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        window.axe.run({}, (error, res) => {
          if (error) reject(error);
          else resolve(res);
        });
      });
    });

    const scanTime = Date.now() - startTime;

    // Normalize results to match backend expectations
    const normalized = {
      id: null, // Backend will assign
      url,
      status: 'COMPLETE',
      timestamp: new Date().toISOString(),
      violations: normalizeResults(results.violations || []),
      passes: normalizeResults(results.passes || []),
      incomplete: normalizeResults(results.incomplete || []),
      inapplicable: normalizeResults(results.inapplicable || []),
      violationCount: results.violations ? results.violations.length : 0,
      passCount: results.passes ? results.passes.length : 0,
      incompleteCount: results.incomplete ? results.incomplete.length : 0,
      error: null,
      scanDurationMs: scanTime
    };

    console.log(`✓ Scanned ${url} in ${scanTime}ms - ${normalized.violationCount} violations found`);
    return normalized;

  } catch (error) {
    console.error(`✗ Scan failed for ${url}: ${error.message}`);
    throw error;
  } finally {
    if (page) {
      try { await page.close(); } catch (e) { }
    }
    if (browser) {
      try { await browser.close(); } catch (e) { }
    }
  }
}

function normalizeResults(items) {
  return items.map(item => ({
    id: item.id,
    description: item.description,
    impact: item.impact,
    help: item.help,
    helpUrl: item.helpUrl,
    tags: item.tags || [],
    nodes: (item.nodes || []).map(node => ({
      html: node.html,
      target: node.target,
      failureSummary: node.failureSummary
    })),
    nodeCount: item.nodes ? item.nodes.length : 0
  }));
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ AccessLens Scanner running on http://localhost:${PORT}`);
});
