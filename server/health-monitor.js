/**
 * Health Monitor - Cron Job Script
 *
 * This script runs periodically to:
 * 1. Check if the main service is healthy
 * 2. Update news data if needed
 * 3. Send alerts if something fails
 */

const { getBackupNews } = require('./backup-service');

const CHECK_INTERVAL = process.env.CHECK_INTERVAL || 60; // minutes

async function healthCheck() {
  const startTime = Date.now();
  const results = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {}
  };

  console.log('=== Health Check Starting ===');

  // Check 1: Fetch news
  try {
    const newsData = await getBackupNews();
    results.checks.newsFetch = {
      status: 'ok',
      articleCount: newsData.news.length,
      source: newsData.source
    };
    console.log(`✓ News fetch: ${newsData.news.length} articles from ${newsData.source}`);
  } catch (error) {
    results.checks.newsFetch = {
      status: 'failed',
      error: error.message
    };
    results.status = 'degraded';
    console.log(`✗ News fetch failed: ${error.message}`);
  }

  // Check 2: Verify article quality
  if (results.checks.newsFetch.status === 'ok') {
    const articles = results.checks.newsFetch.articleCount;
    if (articles < 5) {
      results.status = 'degraded';
      console.log(`⚠ Low article count: ${articles}`);
    }
  }

  // Summary
  const duration = Date.now() - startTime;
  results.duration = `${duration}ms`;

  console.log('=== Health Check Complete ===');
  console.log(`Status: ${results.status.toUpperCase()}`);
  console.log(`Duration: ${duration}ms`);
  console.log(JSON.stringify(results, null, 2));

  return results;
}

// Run health check
healthCheck()
  .then(results => {
    if (results.status === 'healthy') {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Health check error:', error);
    process.exit(1);
  });
