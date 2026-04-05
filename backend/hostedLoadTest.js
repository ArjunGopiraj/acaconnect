/**
 * ACACONNECT - HOSTED APP LOAD TEST
 * Tests against deployed backend on Render
 * Run: node hostedLoadTest.js
 */

const axios = require('axios');

const BASE_URL = 'https://acaconnect-backend.onrender.com';
const ML_URL = 'https://acaconnect-ml.onrender.com';
const CHATBOT_URL = 'https://acaconnect-chatbot.onrender.com';

async function getToken() {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    }, { timeout: 30000 });
    return res.data.token;
  } catch (err) {
    console.log('Login failed:', err.response?.data?.message || err.message);
    return null;
  }
}

async function simulateUser(userId, token, endpoints) {
  const results = [];
  for (const ep of endpoints) {
    const start = Date.now();
    try {
      const url = ep.baseUrl ? `${ep.baseUrl}${ep.url}` : `${BASE_URL}${ep.url}`;
      await axios({
        method: ep.method,
        url,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        data: ep.data || null,
        timeout: 30000
      });
      results.push({ userId, endpoint: ep.name, duration: Date.now() - start, success: true });
    } catch (error) {
      results.push({ userId, endpoint: ep.name, duration: Date.now() - start, success: false, status: error.response?.status || 'TIMEOUT' });
    }
  }
  return results;
}

async function runLoadTest(concurrentUsers, token) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  LOAD TEST: ${concurrentUsers} concurrent users`);
  console.log(`${'─'.repeat(60)}`);

  const endpoints = [
    { name: 'Get Events', method: 'get', url: '/events' },
    { name: 'Get Published Events', method: 'get', url: '/events/published' },
    { name: 'Admin Stats', method: 'get', url: '/admin/stats' },
    { name: 'Income Analytics', method: 'get', url: '/financial/income-analytics' },
    { name: 'Notifications', method: 'get', url: '/notifications' }
  ];

  const start = Date.now();
  const promises = [];
  for (let i = 0; i < concurrentUsers; i++) {
    promises.push(simulateUser(i + 1, token, endpoints));
  }

  const allResults = await Promise.all(promises);
  const totalTime = Date.now() - start;
  const flatResults = allResults.flat();
  const successful = flatResults.filter(r => r.success);
  const failed = flatResults.filter(r => !r.success);
  const durations = successful.map(r => r.duration);
  const sorted = [...durations].sort((a, b) => a - b);
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
  const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
  const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;
  const throughput = ((flatResults.length / totalTime) * 1000).toFixed(2);

  console.log(`  Total Requests: ${flatResults.length}`);
  console.log(`  Successful: ${successful.length} | Failed: ${failed.length}`);
  console.log(`  Error Rate: ${((failed.length / flatResults.length) * 100).toFixed(2)}%`);
  console.log(`  Total Duration: ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`  Throughput: ${throughput} req/s`);
  console.log(`  Response Time → Avg: ${avgDuration}ms | Min: ${minDuration}ms | Max: ${maxDuration}ms | P95: ${p95}ms`);

  // Per-endpoint breakdown
  console.log(`  Per-Endpoint:`);
  const epNames = [...new Set(flatResults.map(r => r.endpoint))];
  epNames.forEach(ep => {
    const epSuccess = flatResults.filter(r => r.endpoint === ep && r.success);
    const epFailed = flatResults.filter(r => r.endpoint === ep && !r.success).length;
    const epDurations = epSuccess.map(r => r.duration);
    const epAvg = epDurations.length > 0 ? Math.round(epDurations.reduce((a, b) => a + b, 0) / epDurations.length) : 0;
    const epMax = epDurations.length > 0 ? Math.max(...epDurations) : 0;
    console.log(`    ${ep}: Avg=${epAvg}ms, Max=${epMax}ms, Errors=${epFailed}`);
  });

  return { users: concurrentUsers, totalRequests: flatResults.length, successful: successful.length, failed: failed.length, errorRate: ((failed.length / flatResults.length) * 100).toFixed(2), avgDuration, maxDuration, minDuration, p95, throughput, totalTime };
}

async function runAPIPerformanceTest(token) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log('  HOSTED API PERFORMANCE TEST');
  console.log(`${'═'.repeat(60)}`);

  const authHeader = { Authorization: `Bearer ${token}` };
  const apis = [
    { name: 'Staff Login', method: 'post', url: '/auth/login', data: { email: 'admin@test.com', password: 'admin123' }, headers: {} },
    { name: 'Get All Events', method: 'get', url: '/events', headers: authHeader },
    { name: 'Get Published Events', method: 'get', url: '/events/published', headers: authHeader },
    { name: 'Get Event Types', method: 'get', url: '/events/types/all', headers: authHeader },
    { name: 'Admin Stats', method: 'get', url: '/admin/stats', headers: authHeader },
    { name: 'Admin Users', method: 'get', url: '/admin/users', headers: authHeader },
    { name: 'Admin Roles', method: 'get', url: '/admin/roles', headers: authHeader },
    { name: 'Income Analytics', method: 'get', url: '/financial/income-analytics', headers: authHeader },
    { name: 'Expense Analytics', method: 'get', url: '/financial/expense-analytics', headers: authHeader },
    { name: 'Budget Variance', method: 'get', url: '/financial/budget-variance', headers: authHeader },
    { name: 'Chart Data', method: 'get', url: '/financial/chart-data', headers: authHeader },
    { name: 'Financial Summary', method: 'get', url: '/financial/summary', headers: authHeader },
    { name: 'Notifications', method: 'get', url: '/notifications', headers: authHeader },
    { name: 'Stationery Items', method: 'get', url: '/stationery', headers: authHeader },
    { name: 'Refreshment Items', method: 'get', url: '/refreshments', headers: authHeader },
    { name: 'Technical Items', method: 'get', url: '/technical', headers: authHeader },
    { name: 'Alumni List', method: 'get', url: '/alumni', headers: authHeader },
    { name: 'Venues', method: 'get', url: '/scheduling/venues', headers: authHeader },
    { name: 'My Registrations', method: 'get', url: '/registrations/my-registrations', headers: authHeader },
    { name: 'ML Health', method: 'get', url: '/health', headers: {}, baseUrl: ML_URL },
    { name: 'Chatbot Health', method: 'get', url: '/health', headers: {}, baseUrl: CHATBOT_URL }
  ];

  const apiResults = [];

  for (const api of apis) {
    const start = Date.now();
    try {
      const url = api.baseUrl ? `${api.baseUrl}${api.url}` : `${BASE_URL}${api.url}`;
      let response;
      if (api.method === 'post') {
        response = await axios.post(url, api.data, { headers: api.headers, timeout: 30000 });
      } else {
        response = await axios.get(url, { headers: api.headers, timeout: 30000 });
      }
      const duration = Date.now() - start;
      let rating = '🟢 Excellent';
      if (duration > 500) rating = '🟡 Good';
      if (duration > 1000) rating = '🟠 Acceptable';
      if (duration > 2000) rating = '🔴 Slow';
      apiResults.push({ name: api.name, duration, status: response.status, rating, success: true });
      console.log(`  ✅ ${api.name}: ${duration}ms (${response.status}) ${rating}`);
    } catch (error) {
      const duration = Date.now() - start;
      apiResults.push({ name: api.name, duration, status: error.response?.status || 'TIMEOUT', rating: '⚫ Failed', success: false });
      console.log(`  ❌ ${api.name}: ${duration}ms (${error.response?.status || 'TIMEOUT'})`);
    }
  }

  const successful = apiResults.filter(r => r.success);
  const durations = successful.map(r => r.duration);
  const avg = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

  console.log(`\n  Summary: ${successful.length}/${apiResults.length} APIs successful | Average: ${avg}ms`);
  return apiResults;
}

async function main() {
  console.log('═'.repeat(60));
  console.log('   ACACONNECT - HOSTED APPLICATION TEST SUITE');
  console.log(`   Backend: ${BASE_URL}`);
  console.log(`   ML Service: ${ML_URL}`);
  console.log(`   Chatbot: ${CHATBOT_URL}`);
  console.log('═'.repeat(60));
  console.log(`Started at: ${new Date().toLocaleString()}`);

  // Wake up Render services (free tier sleeps after inactivity)
  console.log('\n⏳ Waking up services (Render free tier may take 30-60s)...');
  try {
    await axios.get(`${BASE_URL}/auth`, { timeout: 60000 }).catch(() => {});
    await axios.get(`${ML_URL}/health`, { timeout: 60000 }).catch(() => {});
    await axios.get(`${CHATBOT_URL}/health`, { timeout: 60000 }).catch(() => {});
  } catch {}
  console.log('✅ Services pinged\n');

  // Get auth token
  console.log('🔑 Authenticating...');
  const token = await getToken();
  if (!token) {
    console.log('❌ Could not authenticate. Check if backend is running.');
    return;
  }
  console.log('✅ Token received\n');

  // 1. API Performance Test
  const apiResults = await runAPIPerformanceTest(token);

  // 2. Load Tests
  console.log(`\n${'═'.repeat(60)}`);
  console.log('  HOSTED LOAD TEST');
  console.log(`${'═'.repeat(60)}`);

  const loadConfigs = [5, 10, 25, 50];
  const loadResults = [];

  for (const users of loadConfigs) {
    const result = await runLoadTest(users, token);
    if (result) loadResults.push(result);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait between tests
  }

  // Final Summary
  console.log(`\n${'═'.repeat(60)}`);
  console.log('   FINAL SUMMARY - HOSTED APPLICATION');
  console.log(`${'═'.repeat(60)}`);

  console.log('\n--- API Performance (Single Request) ---');
  console.log(`${'API'.padEnd(25)} ${'Time(ms)'.padEnd(10)} ${'Status'.padEnd(8)} Rating`);
  console.log('─'.repeat(60));
  apiResults.forEach(r => {
    console.log(`${r.name.padEnd(25)} ${String(r.duration).padEnd(10)} ${String(r.status).padEnd(8)} ${r.rating}`);
  });

  console.log('\n--- Load Test Summary ---');
  console.log('| Users | Requests | Avg(ms) | P95(ms) | Max(ms) | Error% | Throughput |');
  console.log('|-------|----------|---------|---------|---------|--------|------------|');
  loadResults.forEach(r => {
    console.log(`| ${String(r.users).padEnd(5)} | ${String(r.totalRequests).padEnd(8)} | ${String(r.avgDuration).padEnd(7)} | ${String(r.p95).padEnd(7)} | ${String(r.maxDuration).padEnd(7)} | ${(r.errorRate + '%').padEnd(6)} | ${(r.throughput + ' r/s').padEnd(10)} |`);
  });

  // Comparison with local
  console.log('\n--- Local vs Hosted Comparison ---');
  console.log('| Metric | Local | Hosted |');
  console.log('|--------|-------|--------|');
  if (loadResults.length >= 2) {
    const hosted10 = loadResults.find(r => r.users === 10);
    if (hosted10) {
      console.log(`| 10 Users Avg Response | 395ms | ${hosted10.avgDuration}ms |`);
      console.log(`| 10 Users Error Rate | 0.00% | ${hosted10.errorRate}% |`);
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`Completed at: ${new Date().toLocaleString()}`);
  console.log(`${'═'.repeat(60)}`);
}

main().catch(err => console.error('Test failed:', err.message));
