/**
 * ACACONNECT - Load Testing Script
 * Simulates concurrent users hitting the API
 * Run: node loadTest.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function getToken() {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    return res.data.token;
  } catch {
    return null;
  }
}

async function simulateUser(userId, token, endpoints) {
  const results = [];
  for (const ep of endpoints) {
    const start = Date.now();
    try {
      await axios({
        method: ep.method,
        url: `${BASE_URL}${ep.url}`,
        headers: { Authorization: `Bearer ${token}` },
        data: ep.data || null,
        timeout: 30000
      });
      results.push({ userId, endpoint: ep.name, duration: Date.now() - start, success: true });
    } catch (error) {
      results.push({ userId, endpoint: ep.name, duration: Date.now() - start, success: false, status: error.response?.status });
    }
  }
  return results;
}

async function runLoadTest(concurrentUsers, testName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  LOAD TEST: ${testName} (${concurrentUsers} concurrent users)`);
  console.log(`${'='.repeat(60)}`);

  const token = await getToken();
  if (!token) {
    console.log('❌ Failed to get auth token. Is the backend running?');
    return null;
  }

  const endpoints = [
    { name: 'Get Events', method: 'get', url: '/events' },
    { name: 'Get Published Events', method: 'get', url: '/events/published' },
    { name: 'Admin Stats', method: 'get', url: '/admin/stats' },
    { name: 'Income Analytics', method: 'get', url: '/financial/income-analytics' },
    { name: 'Notifications', method: 'get', url: '/notifications' }
  ];

  const start = Date.now();

  // Launch all concurrent users simultaneously
  const promises = [];
  for (let i = 0; i < concurrentUsers; i++) {
    promises.push(simulateUser(i + 1, token, endpoints));
  }

  const allResults = await Promise.all(promises);
  const totalTime = Date.now() - start;

  // Flatten results
  const flatResults = allResults.flat();
  const successful = flatResults.filter(r => r.success);
  const failed = flatResults.filter(r => !r.success);
  const durations = successful.map(r => r.duration);
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
  const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
  const p95 = durations.length > 0 ? durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.95)] : 0;
  const throughput = ((flatResults.length / totalTime) * 1000).toFixed(2);

  console.log(`\nResults for ${concurrentUsers} concurrent users:`);
  console.log(`  Total Requests: ${flatResults.length}`);
  console.log(`  Successful: ${successful.length}`);
  console.log(`  Failed: ${failed.length}`);
  console.log(`  Error Rate: ${((failed.length / flatResults.length) * 100).toFixed(2)}%`);
  console.log(`  Total Test Duration: ${totalTime}ms`);
  console.log(`  Throughput: ${throughput} requests/sec`);
  console.log(`\n  Response Time:`);
  console.log(`    Average: ${avgDuration}ms`);
  console.log(`    Minimum: ${minDuration}ms`);
  console.log(`    Maximum: ${maxDuration}ms`);
  console.log(`    95th Percentile: ${p95}ms`);

  // Per-endpoint breakdown
  console.log(`\n  Per-Endpoint Breakdown:`);
  endpoints.forEach(ep => {
    const epResults = flatResults.filter(r => r.endpoint === ep.name && r.success);
    const epDurations = epResults.map(r => r.duration);
    const epAvg = epDurations.length > 0 ? Math.round(epDurations.reduce((a, b) => a + b, 0) / epDurations.length) : 0;
    const epMax = epDurations.length > 0 ? Math.max(...epDurations) : 0;
    const epFailed = flatResults.filter(r => r.endpoint === ep.name && !r.success).length;
    console.log(`    ${ep.name}: Avg=${epAvg}ms, Max=${epMax}ms, Errors=${epFailed}`);
  });

  return {
    users: concurrentUsers,
    totalRequests: flatResults.length,
    successful: successful.length,
    failed: failed.length,
    errorRate: ((failed.length / flatResults.length) * 100).toFixed(2),
    avgDuration,
    maxDuration,
    minDuration,
    p95,
    throughput,
    totalTime
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('   ACACONNECT - LOAD TESTING SUITE');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toLocaleString()}`);

  const testConfigs = [10, 25, 50, 100, 200];
  const summaryResults = [];

  for (const users of testConfigs) {
    const result = await runLoadTest(users, `${users} Users`);
    if (result) summaryResults.push(result);
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Final Summary Table
  console.log(`\n${'='.repeat(60)}`);
  console.log('   LOAD TEST SUMMARY');
  console.log('='.repeat(60));
  console.log('\n| Concurrent Users | Total Requests | Avg Response (ms) | 95th Percentile (ms) | Error Rate | Throughput (req/s) |');
  console.log('|---|---|---|---|---|---|');
  summaryResults.forEach(r => {
    console.log(`| ${r.users} | ${r.totalRequests} | ${r.avgDuration} | ${r.p95} | ${r.errorRate}% | ${r.throughput} |`);
  });

  // Scalability Assessment
  console.log('\n--- Scalability Assessment ---');
  if (summaryResults.length >= 2) {
    const first = summaryResults[0];
    const last = summaryResults[summaryResults.length - 1];
    const degradation = ((last.avgDuration - first.avgDuration) / first.avgDuration * 100).toFixed(1);
    console.log(`  Response time degradation from ${first.users} to ${last.users} users: ${degradation}%`);
    
    if (last.errorRate < 1) {
      console.log(`  ✅ System handles ${last.users} concurrent users with <1% error rate`);
    } else if (last.errorRate < 5) {
      console.log(`  🟡 System handles ${last.users} concurrent users with acceptable error rate`);
    } else {
      console.log(`  🔴 Performance degrades significantly at ${last.users} concurrent users`);
    }
  }

  console.log(`\nCompleted at: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));
}

main().catch(err => console.error('Load test failed:', err.message));
