/**
 * ACACONNECT - API Performance Test Script
 * Run: node performanceTest.js
 * Make sure backend is running on port 5000
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let staffToken = '';
let participantToken = '';
let eventId = '';

const results = [];

async function measureAPI(name, method, url, data = null, headers = {}) {
  const start = Date.now();
  try {
    let response;
    const config = { headers, timeout: 30000 };
    if (method === 'get') {
      response = await axios.get(`${BASE_URL}${url}`, config);
    } else if (method === 'post') {
      response = await axios.post(`${BASE_URL}${url}`, data, config);
    } else if (method === 'put') {
      response = await axios.put(`${BASE_URL}${url}`, data, config);
    }
    const duration = Date.now() - start;
    results.push({ name, method: method.toUpperCase(), url, duration, status: response.status, success: true });
    console.log(`  ✅ ${name}: ${duration}ms (Status: ${response.status})`);
    return response;
  } catch (error) {
    const duration = Date.now() - start;
    const status = error.response?.status || 'TIMEOUT';
    results.push({ name, method: method.toUpperCase(), url, duration, status, success: false });
    console.log(`  ❌ ${name}: ${duration}ms (Status: ${status})`);
    return null;
  }
}

async function runTests() {
  console.log('='.repeat(70));
  console.log('   ACACONNECT - API PERFORMANCE TEST');
  console.log('='.repeat(70));
  console.log(`Started at: ${new Date().toLocaleString()}`);

  // ==========================================
  // 1. AUTHENTICATION APIs
  // ==========================================
  console.log('\n--- 1. AUTHENTICATION APIs ---');

  const loginRes = await measureAPI('Staff Login (Admin)', 'post', '/auth/login', { email: 'admin@test.com', password: 'admin123' });
  if (loginRes?.data?.token) staffToken = loginRes.data.token;

  await measureAPI('Staff Login (Event Team)', 'post', '/auth/login', { email: 'event@test.com', password: 'event123' });
  await measureAPI('Staff Login (Treasurer)', 'post', '/auth/login', { email: 'treasurer@test.com', password: 'treasurer123' });
  await measureAPI('Staff Login (GenSec)', 'post', '/auth/login', { email: 'gensec@test.com', password: 'gensec123' });
  await measureAPI('Staff Login (Chairperson)', 'post', '/auth/login', { email: 'chair@test.com', password: 'chair123' });

  // Invalid login test
  await measureAPI('Invalid Login (Wrong Password)', 'post', '/auth/login', { email: 'admin@test.com', password: 'wrongpassword' });

  // Participant login - try to get token
  const partRes = await measureAPI('Participant Login', 'post', '/participant-auth/login', { email: '2024179001@student.annauniv.edu', password: 'Arjun@2024' });
  if (partRes?.data?.token) participantToken = partRes.data.token;

  // If participant login failed, use staff token as fallback for participant-related tests
  if (!participantToken) {
    console.log('  ⚠️  Participant login failed, using staff token for remaining tests');
    participantToken = staffToken;
  }

  if (!staffToken) {
    console.log('\n❌ Could not get staff token. Is the backend running on port 5000?');
    return;
  }

  const authHeader = { Authorization: `Bearer ${staffToken}` };
  const partAuthHeader = { Authorization: `Bearer ${participantToken}` };

  // ==========================================
  // 2. EVENT MANAGEMENT APIs
  // ==========================================
  console.log('\n--- 2. EVENT MANAGEMENT APIs ---');

  const eventsRes = await measureAPI('Get All Events', 'get', '/events', null, authHeader);
  if (eventsRes?.data?.length > 0) eventId = eventsRes.data[0]._id;

  await measureAPI('Get Published Events', 'get', '/events/published', null, authHeader);

  if (eventId) {
    await measureAPI('Get Single Event by ID', 'get', `/events/${eventId}`, null, authHeader);
  }

  await measureAPI('Get Event Types', 'get', '/events/types/all', null, authHeader);

  // ==========================================
  // 3. REGISTRATION APIs
  // ==========================================
  console.log('\n--- 3. REGISTRATION APIs ---');

  await measureAPI('Get My Registrations', 'get', '/registrations/my-registrations', null, partAuthHeader);

  if (eventId) {
    await measureAPI('Check Registration Status', 'get', `/registrations/events/${eventId}/check`, null, partAuthHeader);
  }

  // ==========================================
  // 4. ADMIN APIs
  // ==========================================
  console.log('\n--- 4. ADMIN APIs ---');

  await measureAPI('Admin - Get System Stats', 'get', '/admin/stats', null, authHeader);
  await measureAPI('Admin - Get All Users', 'get', '/admin/users', null, authHeader);
  await measureAPI('Admin - Get All Roles', 'get', '/admin/roles', null, authHeader);

  // ==========================================
  // 5. FINANCIAL APIs
  // ==========================================
  console.log('\n--- 5. FINANCIAL APIs ---');

  await measureAPI('Income Analytics', 'get', '/financial/income-analytics', null, authHeader);
  await measureAPI('Expense Analytics', 'get', '/financial/expense-analytics', null, authHeader);
  await measureAPI('Budget Variance', 'get', '/financial/budget-variance', null, authHeader);
  await measureAPI('Chart Data', 'get', '/financial/chart-data', null, authHeader);
  await measureAPI('Financial Summary', 'get', '/financial/summary', null, authHeader);

  // ==========================================
  // 6. OPERATIONAL TEAM APIs
  // ==========================================
  console.log('\n--- 6. OPERATIONAL TEAM APIs ---');

  await measureAPI('Logistics - Get Events', 'get', '/logistics/events', null, authHeader);
  await measureAPI('Logistics - Get Expense Events', 'get', '/logistics/expense-events', null, authHeader);
  await measureAPI('HR - Get Events', 'get', '/hr/events', null, authHeader);
  await measureAPI('Hospitality - Get Events', 'get', '/hospitality/events', null, authHeader);

  // ==========================================
  // 7. SCHEDULING APIs
  // ==========================================
  console.log('\n--- 7. SCHEDULING APIs ---');

  await measureAPI('Get All Venues', 'get', '/scheduling/venues', null, authHeader);
  await measureAPI('Get Volunteer Pool', 'get', '/scheduling/volunteers', null, authHeader);

  // ==========================================
  // 8. NOTIFICATION APIs
  // ==========================================
  console.log('\n--- 8. NOTIFICATION APIs ---');

  await measureAPI('Get Staff Notifications', 'get', '/notifications', null, authHeader);
  await measureAPI('Get Participant Notifications', 'get', '/participant-notifications', null, partAuthHeader);

  // ==========================================
  // 9. ML SERVICE API
  // ==========================================
  console.log('\n--- 9. ML SERVICE API ---');

  await measureAPI('ML Health Check', 'get', '/ml/health', null, {});

  // ==========================================
  // 10. CHATBOT API
  // ==========================================
  console.log('\n--- 10. CHATBOT API ---');

  await measureAPI('Chatbot Health Check', 'get', '/chatbot/health', null, {});

  // ==========================================
  // 11. OTHER APIs
  // ==========================================
  console.log('\n--- 11. OTHER APIs ---');

  await measureAPI('Get Stationery Items', 'get', '/stationery', null, authHeader);
  await measureAPI('Get Refreshment Items', 'get', '/refreshments', null, authHeader);
  await measureAPI('Get Technical Items', 'get', '/technical', null, authHeader);
  await measureAPI('Get Alumni List', 'get', '/alumni', null, authHeader);

  // ==========================================
  // RESULTS SUMMARY
  // ==========================================
  console.log('\n' + '='.repeat(70));
  console.log('   PERFORMANCE TEST RESULTS SUMMARY');
  console.log('='.repeat(70));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const durations = successful.map(r => r.duration);
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
  const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
  const sorted = [...durations].sort((a, b) => a - b);
  const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;

  console.log(`\nTotal APIs Tested: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Success Rate: ${((successful.length / results.length) * 100).toFixed(1)}%`);
  console.log(`\nResponse Time Statistics:`);
  console.log(`  Average: ${avgDuration}ms`);
  console.log(`  Minimum: ${minDuration}ms`);
  console.log(`  Maximum: ${maxDuration}ms`);
  console.log(`  95th Percentile: ${p95}ms`);

  // Performance rating table
  console.log('\n--- Detailed Results ---');
  console.log(`${'API Name'.padEnd(40)} ${'Method'.padEnd(8)} ${'Time(ms)'.padEnd(10)} ${'Status'.padEnd(8)} Rating`);
  console.log('-'.repeat(85));
  results.forEach(r => {
    let rating = '🟢 Excellent';
    if (r.duration > 200) rating = '🟡 Good';
    if (r.duration > 500) rating = '🟠 Acceptable';
    if (r.duration > 1000) rating = '🔴 Slow';
    if (!r.success) rating = '⚫ Failed';
    console.log(`${r.name.padEnd(40)} ${r.method.padEnd(8)} ${String(r.duration).padEnd(10)} ${String(r.status).padEnd(8)} ${rating}`);
  });

  // Category averages
  console.log('\n--- Category-wise Average Response Time ---');
  const catMap = {};
  results.filter(r => r.success).forEach(r => {
    const parts = r.name.split(' - ');
    const cat = parts.length > 1 ? parts[0] : r.name.split(' (')[0];
    if (!catMap[cat]) catMap[cat] = [];
    catMap[cat].push(r.duration);
  });
  Object.entries(catMap).forEach(([cat, times]) => {
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    console.log(`  ${cat}: ${avg}ms avg (${times.length} APIs)`);
  });

  console.log('\n' + '='.repeat(70));
  console.log(`Completed at: ${new Date().toLocaleString()}`);
  console.log('='.repeat(70));
}

runTests().catch(err => {
  console.error('Test execution failed:', err.message);
});
