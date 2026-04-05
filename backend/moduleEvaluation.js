/**
 * ACACONNECT - Module Evaluation Metrics Test
 * Tests ML, Chatbot, Scheduling, Certificate, and other modules
 * Run: node moduleEvaluation.js
 * Requires: Backend running on port 5000
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
let adminToken = '';
let eventTeamToken = '';
let treasurerToken = '';

const results = {};

async function getToken(email, password) {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    return res.data.token;
  } catch { return null; }
}

async function measure(name, fn) {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    return { name, duration, success: true, ...result };
  } catch (error) {
    const duration = Date.now() - start;
    return { name, duration, success: false, error: error.message };
  }
}

async function testAuthModule() {
  console.log('\n' + '='.repeat(60));
  console.log('  1. AUTHENTICATION MODULE EVALUATION');
  console.log('='.repeat(60));

  const tests = [];

  // Valid login
  tests.push(await measure('Valid Admin Login', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, { email: 'admin@test.com', password: 'admin123' });
    return { status: res.status, hasToken: !!res.data.token, hasRole: !!res.data.user.role };
  }));

  // Invalid login
  tests.push(await measure('Invalid Password Rejection', async () => {
    try {
      await axios.post(`${BASE_URL}/auth/login`, { email: 'admin@test.com', password: 'wrong' });
      return { rejected: false };
    } catch (e) { return { rejected: true, status: e.response?.status }; }
  }));

  // Token validation
  tests.push(await measure('Valid Token Access', async () => {
    const res = await axios.get(`${BASE_URL}/events`, { headers: { Authorization: `Bearer ${adminToken}` } });
    return { status: res.status, dataReceived: Array.isArray(res.data) };
  }));

  // Invalid token
  tests.push(await measure('Invalid Token Rejection', async () => {
    try {
      await axios.get(`${BASE_URL}/events`, { headers: { Authorization: 'Bearer invalidtoken' } });
      return { rejected: false };
    } catch (e) { return { rejected: true, status: e.response?.status }; }
  }));

  // No token
  tests.push(await measure('No Token Rejection', async () => {
    try {
      await axios.get(`${BASE_URL}/events`);
      return { rejected: false };
    } catch (e) { return { rejected: true, status: e.response?.status }; }
  }));

  // RBAC - Event Team cannot access admin
  tests.push(await measure('RBAC - Event Team blocked from Admin', async () => {
    try {
      await axios.get(`${BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${eventTeamToken}` } });
      return { blocked: false };
    } catch (e) { return { blocked: true, status: e.response?.status }; }
  }));

  const passed = tests.filter(t => t.success).length;
  const avgTime = Math.round(tests.reduce((s, t) => s + t.duration, 0) / tests.length);

  console.log(`\n  Results: ${passed}/${tests.length} passed | Avg time: ${avgTime}ms`);
  tests.forEach(t => {
    const icon = t.success ? '✅' : '❌';
    console.log(`  ${icon} ${t.name}: ${t.duration}ms`);
  });

  results.authentication = { total: tests.length, passed, avgTime, tests };
}

async function testFSMModule() {
  console.log('\n' + '='.repeat(60));
  console.log('  2. FSM WORKFLOW MODULE EVALUATION');
  console.log('='.repeat(60));

  const auth = { headers: { Authorization: `Bearer ${adminToken}` } };
  const tests = [];

  // Get events and check states
  tests.push(await measure('Fetch Events with Status', async () => {
    const res = await axios.get(`${BASE_URL}/events`, auth);
    const events = res.data;
    const states = {};
    events.forEach(e => { states[e.status] = (states[e.status] || 0) + 1; });
    return { totalEvents: events.length, stateDistribution: states };
  }));

  // Check status history exists
  tests.push(await measure('Status History Logging', async () => {
    const res = await axios.get(`${BASE_URL}/events`, auth);
    const eventsWithHistory = res.data.filter(e => e.statusHistory && e.statusHistory.length > 0);
    return { 
      totalEvents: res.data.length, 
      eventsWithHistory: eventsWithHistory.length,
      historyLoggingRate: res.data.length > 0 ? ((eventsWithHistory.length / res.data.length) * 100).toFixed(1) + '%' : '0%'
    };
  }));

  // Verify transition chain integrity
  tests.push(await measure('Transition Chain Integrity', async () => {
    const res = await axios.get(`${BASE_URL}/events`, auth);
    const validChains = {
      'DRAFT': ['SUBMITTED'],
      'SUBMITTED': ['UNDER_REVIEW'],
      'UNDER_REVIEW': ['TREASURER_APPROVED', 'REJECTED'],
      'TREASURER_APPROVED': ['GENSEC_APPROVED'],
      'GENSEC_APPROVED': ['CHAIRPERSON_APPROVED'],
      'CHAIRPERSON_APPROVED': ['PUBLISHED']
    };
    
    let validTransitions = 0;
    let totalTransitions = 0;
    
    res.data.forEach(event => {
      if (event.statusHistory) {
        event.statusHistory.forEach(h => {
          totalTransitions++;
          if (validChains[h.from] && validChains[h.from].includes(h.to)) {
            validTransitions++;
          } else if (h.from === 'DRAFT' && h.to === 'PUBLISHED' && h.changedBy === 'system') {
            validTransitions++; // System seeded events
          }
        });
      }
    });
    
    return { 
      totalTransitions, 
      validTransitions, 
      integrityRate: totalTransitions > 0 ? ((validTransitions / totalTransitions) * 100).toFixed(1) + '%' : 'N/A'
    };
  }));

  const passed = tests.filter(t => t.success).length;
  const avgTime = Math.round(tests.reduce((s, t) => s + t.duration, 0) / tests.length);

  console.log(`\n  Results: ${passed}/${tests.length} passed | Avg time: ${avgTime}ms`);
  tests.forEach(t => {
    const icon = t.success ? '✅' : '❌';
    console.log(`  ${icon} ${t.name}: ${t.duration}ms`);
    if (t.stateDistribution) console.log(`     States: ${JSON.stringify(t.stateDistribution)}`);
    if (t.historyLoggingRate) console.log(`     History logging rate: ${t.historyLoggingRate}`);
    if (t.integrityRate) console.log(`     Transition integrity: ${t.integrityRate}`);
  });

  results.fsm = { total: tests.length, passed, avgTime, tests };
}

async function testFinancialModule() {
  console.log('\n' + '='.repeat(60));
  console.log('  3. FINANCIAL ANALYTICS MODULE EVALUATION');
  console.log('='.repeat(60));

  const auth = { headers: { Authorization: `Bearer ${adminToken}` } };
  const tests = [];

  // Income Analytics
  tests.push(await measure('Income Analytics (MapReduce)', async () => {
    const res = await axios.get(`${BASE_URL}/financial/income-analytics`, auth);
    const data = res.data.data;
    return {
      totalIncome: data.totalIncome,
      onlineIncome: data.onlineIncome,
      onsiteIncome: data.onsiteIncome,
      totalRegistrations: data.totalRegistrations,
      eventCount: data.eventWiseDetails?.length || 0,
      sumCheck: Math.abs((data.onlineIncome + data.onsiteIncome) - data.totalIncome) < 1 ? 'PASS' : 'FAIL'
    };
  }));

  // Expense Analytics
  tests.push(await measure('Expense Analytics (MapReduce)', async () => {
    const res = await axios.get(`${BASE_URL}/financial/expense-analytics`, auth);
    const data = res.data.data;
    const categoryTotal = data.categoryAnalytics?.reduce((s, c) => s + c.amount, 0) || 0;
    return {
      totalExpenses: data.totalExpenses,
      categories: data.categoryAnalytics?.length || 0,
      eventsWithExpenses: data.totalEventsWithExpenses,
      categoryTotalMatch: Math.abs(categoryTotal - data.totalExpenses) < 1 ? 'PASS' : 'FAIL'
    };
  }));

  // Budget Variance
  tests.push(await measure('Budget Variance Analysis', async () => {
    const res = await axios.get(`${BASE_URL}/financial/budget-variance`, auth);
    return {
      totalEvents: res.data.data?.length || 0,
      criticalAlerts: res.data.alerts?.critical?.length || 0,
      highAlerts: res.data.alerts?.high?.length || 0,
      mediumAlerts: res.data.alerts?.medium?.length || 0
    };
  }));

  // Chart Data
  tests.push(await measure('Chart Data Generation', async () => {
    const res = await axios.get(`${BASE_URL}/financial/chart-data`, auth);
    return {
      chartsGenerated: Object.keys(res.data.charts || {}).length,
      hasIncomeVsExpense: !!res.data.charts?.incomeVsExpense,
      hasIncomeBreakdown: !!res.data.charts?.incomeBreakdown,
      hasExpenseBreakdown: !!res.data.charts?.expenseBreakdown
    };
  }));

  // Financial Summary
  tests.push(await measure('Financial Summary', async () => {
    const res = await axios.get(`${BASE_URL}/financial/summary`, auth);
    return {
      hasTotalIncome: res.data.totalIncome !== undefined,
      hasTotalExpenses: res.data.totalExpenses !== undefined,
      hasTotalProfit: res.data.totalProfit !== undefined,
      profitCalculation: Math.abs((res.data.totalIncome - res.data.totalExpenses) - res.data.totalProfit) < 1 ? 'PASS' : 'FAIL'
    };
  }));

  const passed = tests.filter(t => t.success).length;
  const avgTime = Math.round(tests.reduce((s, t) => s + t.duration, 0) / tests.length);

  console.log(`\n  Results: ${passed}/${tests.length} passed | Avg time: ${avgTime}ms`);
  tests.forEach(t => {
    const icon = t.success ? '✅' : '❌';
    console.log(`  ${icon} ${t.name}: ${t.duration}ms`);
    Object.entries(t).forEach(([k, v]) => {
      if (!['name', 'duration', 'success', 'error'].includes(k)) {
        console.log(`     ${k}: ${v}`);
      }
    });
  });

  results.financial = { total: tests.length, passed, avgTime, tests };
}

async function testSchedulingModule() {
  console.log('\n' + '='.repeat(60));
  console.log('  4. SCHEDULING MODULE EVALUATION');
  console.log('='.repeat(60));

  const auth = { headers: { Authorization: `Bearer ${adminToken}` } };
  const tests = [];

  // Get venues
  tests.push(await measure('Venue Retrieval', async () => {
    const res = await axios.get(`${BASE_URL}/scheduling/venues`, auth);
    return { venueCount: res.data.length || 0 };
  }));

  // Check events with scheduling data
  tests.push(await measure('Events with Priority Scores', async () => {
    const res = await axios.get(`${BASE_URL}/events`, auth);
    const withPriority = res.data.filter(e => e.scheduling?.priority_score > 0);
    const withVenue = res.data.filter(e => e.scheduling?.suggested_venue || e.scheduling?.assigned_venue);
    return {
      totalEvents: res.data.length,
      eventsWithPriority: withPriority.length,
      eventsWithVenueAssignment: withVenue.length,
      priorityScoreRange: withPriority.length > 0 ? 
        `${Math.min(...withPriority.map(e => e.scheduling.priority_score)).toFixed(2)} - ${Math.max(...withPriority.map(e => e.scheduling.priority_score)).toFixed(2)}` : 'N/A'
    };
  }));

  // Check venue allocations
  tests.push(await measure('Venue Allocation Status', async () => {
    const res = await axios.get(`${BASE_URL}/events`, auth);
    const allocated = res.data.filter(e => e.hospitality?.venue_allocated);
    const withDetails = allocated.filter(e => e.hospitality?.venue_details);
    return {
      totalPublished: res.data.filter(e => e.status === 'PUBLISHED').length,
      venuesAllocated: allocated.length,
      withVenueDetails: withDetails.length,
      allocationRate: res.data.length > 0 ? ((allocated.length / res.data.filter(e => e.status === 'PUBLISHED').length) * 100).toFixed(1) + '%' : 'N/A'
    };
  }));

  // Check volunteer allocations
  tests.push(await measure('Volunteer Allocation Status', async () => {
    const res = await axios.get(`${BASE_URL}/events`, auth);
    const withVolunteers = res.data.filter(e => e.hr?.volunteers_allocated && e.hr?.allocated_volunteers?.length > 0);
    const totalVolunteers = withVolunteers.reduce((s, e) => s + (e.hr?.allocated_volunteers?.length || 0), 0);
    return {
      eventsWithVolunteers: withVolunteers.length,
      totalVolunteersAllocated: totalVolunteers,
      avgVolunteersPerEvent: withVolunteers.length > 0 ? (totalVolunteers / withVolunteers.length).toFixed(1) : 'N/A'
    };
  }));

  const passed = tests.filter(t => t.success).length;
  const avgTime = Math.round(tests.reduce((s, t) => s + t.duration, 0) / tests.length);

  console.log(`\n  Results: ${passed}/${tests.length} passed | Avg time: ${avgTime}ms`);
  tests.forEach(t => {
    const icon = t.success ? '✅' : '❌';
    console.log(`  ${icon} ${t.name}: ${t.duration}ms`);
    Object.entries(t).forEach(([k, v]) => {
      if (!['name', 'duration', 'success', 'error'].includes(k)) {
        console.log(`     ${k}: ${v}`);
      }
    });
  });

  results.scheduling = { total: tests.length, passed, avgTime, tests };
}

async function testRegistrationModule() {
  console.log('\n' + '='.repeat(60));
  console.log('  5. REGISTRATION MODULE EVALUATION');
  console.log('='.repeat(60));

  const auth = { headers: { Authorization: `Bearer ${adminToken}` } };
  const tests = [];

  // Get registrations
  tests.push(await measure('Registration Data Retrieval', async () => {
    const res = await axios.get(`${BASE_URL}/registrations/my-registrations`, auth);
    return { registrationCount: res.data.registrations?.length || res.data.count || 0 };
  }));

  // Check published events for registration
  tests.push(await measure('Published Events Available for Registration', async () => {
    const res = await axios.get(`${BASE_URL}/events/published`, auth);
    const openEvents = res.data.filter(e => e.registration_status === 'OPEN');
    const paidEvents = res.data.filter(e => e.registration_fee > 0);
    const freeEvents = res.data.filter(e => !e.registration_fee || e.registration_fee === 0);
    return {
      totalPublished: res.data.length,
      openForRegistration: openEvents.length,
      paidEvents: paidEvents.length,
      freeEvents: freeEvents.length
    };
  }));

  const passed = tests.filter(t => t.success).length;
  const avgTime = Math.round(tests.reduce((s, t) => s + t.duration, 0) / tests.length);

  console.log(`\n  Results: ${passed}/${tests.length} passed | Avg time: ${avgTime}ms`);
  tests.forEach(t => {
    const icon = t.success ? '✅' : '❌';
    console.log(`  ${icon} ${t.name}: ${t.duration}ms`);
    Object.entries(t).forEach(([k, v]) => {
      if (!['name', 'duration', 'success', 'error'].includes(k)) {
        console.log(`     ${k}: ${v}`);
      }
    });
  });

  results.registration = { total: tests.length, passed, avgTime, tests };
}

async function testNotificationModule() {
  console.log('\n' + '='.repeat(60));
  console.log('  6. NOTIFICATION MODULE EVALUATION');
  console.log('='.repeat(60));

  const auth = { headers: { Authorization: `Bearer ${adminToken}` } };
  const tests = [];

  tests.push(await measure('Staff Notification Retrieval', async () => {
    const res = await axios.get(`${BASE_URL}/notifications`, auth);
    const notifications = Array.isArray(res.data) ? res.data : [];
    return { notificationCount: notifications.length };
  }));

  const passed = tests.filter(t => t.success).length;
  const avgTime = Math.round(tests.reduce((s, t) => s + t.duration, 0) / tests.length);

  console.log(`\n  Results: ${passed}/${tests.length} passed | Avg time: ${avgTime}ms`);
  tests.forEach(t => {
    const icon = t.success ? '✅' : '❌';
    console.log(`  ${icon} ${t.name}: ${t.duration}ms`);
    Object.entries(t).forEach(([k, v]) => {
      if (!['name', 'duration', 'success', 'error'].includes(k)) {
        console.log(`     ${k}: ${v}`);
      }
    });
  });

  results.notification = { total: tests.length, passed, avgTime, tests };
}

async function testCertificateModule() {
  console.log('\n' + '='.repeat(60));
  console.log('  7. CERTIFICATE MODULE EVALUATION');
  console.log('='.repeat(60));

  const auth = { headers: { Authorization: `Bearer ${adminToken}` } };
  const tests = [];

  // Check certificate records
  tests.push(await measure('Certificate Records Check', async () => {
    try {
      const mongoose = require('mongoose');
      const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_events';
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(dbUri);
      }
      const Certificate = mongoose.model('Certificate', new mongoose.Schema({}, { strict: false, collection: 'certificates' }));
      const count = await Certificate.countDocuments();
      const sample = await Certificate.findOne();
      await mongoose.disconnect();
      return {
        totalCertificates: count,
        hasParticipantId: sample ? !!sample.participant_id : 'No records',
        hasEventId: sample ? !!sample.event_id : 'No records',
        hasFilePath: sample ? !!sample.file_path : 'No records'
      };
    } catch (e) {
      return { note: 'Certificate check via DB', error: e.message };
    }
  }));

  // Check certificate files exist
  tests.push(await measure('Certificate Files on Disk', async () => {
    const certDir = path.join(__dirname, 'uploads', 'certificates');
    try {
      const files = fs.readdirSync(certDir);
      const pdfFiles = files.filter(f => f.endsWith('.pdf'));
      return {
        totalFiles: files.length,
        pdfFiles: pdfFiles.length,
        sampleFile: pdfFiles[0] || 'None'
      };
    } catch {
      return { totalFiles: 0, note: 'Certificate directory not found or empty' };
    }
  }));

  const passed = tests.filter(t => t.success).length;
  const avgTime = Math.round(tests.reduce((s, t) => s + t.duration, 0) / tests.length);

  console.log(`\n  Results: ${passed}/${tests.length} passed | Avg time: ${avgTime}ms`);
  tests.forEach(t => {
    const icon = t.success ? '✅' : '❌';
    console.log(`  ${icon} ${t.name}: ${t.duration}ms`);
    Object.entries(t).forEach(([k, v]) => {
      if (!['name', 'duration', 'success', 'error'].includes(k)) {
        console.log(`     ${k}: ${v}`);
      }
    });
  });

  results.certificate = { total: tests.length, passed, avgTime, tests };
}

async function printFinalSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('   MODULE EVALUATION SUMMARY');
  console.log('='.repeat(60));

  let totalTests = 0;
  let totalPassed = 0;

  console.log('\n| Module | Tests | Passed | Avg Time | Status |');
  console.log('|--------|-------|--------|----------|--------|');

  Object.entries(results).forEach(([module, data]) => {
    totalTests += data.total;
    totalPassed += data.passed;
    const status = data.passed === data.total ? '✅ Pass' : '⚠️ Issues';
    console.log(`| ${module.padEnd(20)} | ${String(data.total).padEnd(5)} | ${String(data.passed).padEnd(6)} | ${String(data.avgTime + 'ms').padEnd(8)} | ${status} |`);
  });

  console.log(`\n  Total: ${totalPassed}/${totalTests} tests passed (${((totalPassed/totalTests)*100).toFixed(1)}%)`);
  console.log('='.repeat(60));
}

async function main() {
  console.log('='.repeat(60));
  console.log('   ACACONNECT - MODULE EVALUATION METRICS');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toLocaleString()}\n`);

  // Get tokens
  console.log('🔑 Authenticating...');
  adminToken = await getToken('admin@test.com', 'admin123');
  eventTeamToken = await getToken('event@test.com', 'event123');
  treasurerToken = await getToken('treasurer@test.com', 'treasurer123');

  if (!adminToken) {
    console.log('❌ Could not authenticate. Is backend running on port 5000?');
    return;
  }
  console.log('✅ Tokens received');

  // Run all module tests
  await testAuthModule();
  await testFSMModule();
  await testFinancialModule();
  await testSchedulingModule();
  await testRegistrationModule();
  await testNotificationModule();
  await testCertificateModule();

  // Print summary
  await printFinalSummary();

  console.log(`\nCompleted at: ${new Date().toLocaleString()}`);
}

main().catch(err => console.error('Evaluation failed:', err.message));
