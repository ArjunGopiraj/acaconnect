const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const eventId = '699fecdecb4e5d3b419d6764'; // From previous test

async function login(email, password) {
  const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  return response.data.token;
}

async function testPredicateRouting() {
  console.log('🔍 TESTING PREDICATE-BASED ROUTING SYSTEM');
  console.log('==========================================\n');

  try {
    // Test with different role users
    const tokens = {
      hr: await login('hr@test.com', 'hr123'),
      logistics: await login('logistics@test.com', 'logistics123'),
      hospitality: await login('hospitality@test.com', 'hospitality123'),
      admin: await login('admin@test.com', 'admin123')
    };

    console.log('✅ All role users authenticated\n');

    // Test 1: Enhanced Events Endpoint
    console.log('1️⃣ Testing Enhanced Events Endpoint');
    for (const [role, token] of Object.entries(tokens)) {
      try {
        const response = await axios.get(`${BASE_URL}/requirements/enhanced/events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${role.toUpperCase()}: ${response.data.events?.length || 0} events`);
      } catch (error) {
        console.log(`❌ ${role.toUpperCase()}: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 2: Requirement Distribution
    console.log('\n2️⃣ Testing Requirement Distribution');
    for (const [role, token] of Object.entries(tokens)) {
      try {
        const response = await axios.get(`${BASE_URL}/requirements/enhanced/distribution/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${role.toUpperCase()}: Distribution retrieved`);
        console.log(`   HR Priority: ${response.data.distribution?.HR?.priority || 'N/A'}`);
        console.log(`   Logistics Priority: ${response.data.distribution?.LOGISTICS?.priority || 'N/A'}`);
        console.log(`   Hospitality Priority: ${response.data.distribution?.HOSPITALITY?.priority || 'N/A'}`);
      } catch (error) {
        console.log(`❌ ${role.toUpperCase()}: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 3: Pending Actions
    console.log('\n3️⃣ Testing Pending Actions');
    for (const [role, token] of Object.entries(tokens)) {
      try {
        const response = await axios.get(`${BASE_URL}/requirements/enhanced/pending-actions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${role.toUpperCase()}: ${response.data.length || 0} pending actions`);
        if (response.data.length > 0) {
          response.data.forEach(action => {
            console.log(`   - ${action.event_title}: ${action.actions?.length || 0} actions`);
          });
        }
      } catch (error) {
        console.log(`❌ ${role.toUpperCase()}: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 4: Action Validation
    console.log('\n4️⃣ Testing Action Validation');
    const validations = [
      { role: 'hr', action: 'acknowledge_hr' },
      { role: 'logistics', action: 'acknowledge_logistics' },
      { role: 'hospitality', action: 'acknowledge_hospitality' }
    ];

    for (const { role, action } of validations) {
      try {
        const response = await axios.get(
          `${BASE_URL}/requirements/enhanced/validate/${eventId}/${action}`,
          { headers: { Authorization: `Bearer ${tokens[role]}` } }
        );
        console.log(`✅ ${role.toUpperCase()} can perform ${action}: ${response.data.canPerform}`);
      } catch (error) {
        console.log(`❌ ${role.toUpperCase()} ${action}: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 5: Dashboard Stats
    console.log('\n5️⃣ Testing Dashboard Stats');
    for (const [role, token] of Object.entries(tokens)) {
      try {
        const response = await axios.get(`${BASE_URL}/requirements/enhanced/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${role.toUpperCase()}: Stats retrieved`);
        console.log(`   Total Events: ${response.data.totalEvents || 0}`);
        console.log(`   Pending Actions: ${response.data.pendingActions || 0}`);
      } catch (error) {
        console.log(`❌ ${role.toUpperCase()}: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n🎉 PREDICATE ROUTING TEST COMPLETE');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPredicateRouting();