# Workflow Testing Guide

This guide explains how to test the complete event creation to venue allocation workflow.

## Prerequisites

### 1. Backend Server Running
```bash
cd backend
npm start
# Server should be running on http://localhost:5000
```

### 2. MongoDB Running
- Ensure MongoDB is running
- Database: `college_events`

### 3. Test Users Created
You need the following users in your database:

| Role | Email | Password | Department |
|------|-------|----------|------------|
| Event Team | eventteam@college.edu | password123 | Event Team |
| Treasurer | treasurer@college.edu | password123 | Treasurer |
| Gen Sec | gensec@college.edu | password123 | General Secretary |
| Chairperson | chairperson@college.edu | password123 | Chairperson |
| Hospitality | hospitality@college.edu | password123 | Hospitality |

**Note**: If these users don't exist, create them through the signup endpoints or MongoDB directly.

## Running Tests

### Option 1: Python Script (Recommended)

**Install dependencies:**
```bash
pip install requests
```

**Run tests:**
```bash
python test_workflow.py
```

### Option 2: Node.js Script

**Install dependencies:**
```bash
npm install axios
```

**Run tests:**
```bash
node test_workflow.js
```

## Test Flow

The test script performs the following 12 tests in sequence:

### Phase 1: Event Creation
1. **Create Event** - Event Team creates a test hackathon event
2. **Check Schedule Conflicts** - Verifies conflict detection system
3. **Submit Event** - Submits event for approval chain

### Phase 2: Approval Chain
4. **Treasurer Approval** - Treasurer approves and sets registration fee
5. **Gen Sec Approval** - General Secretary approves event
6. **Chairperson Approval** - Chairperson gives final approval (status → PUBLISHED)

### Phase 3: Venue Allocation
7. **View Requirements** - Hospitality team views event requirements
8. **Acknowledge Requirements** - Hospitality acknowledges requirements
9. **Auto-Generate Venue** - Tests scheduling algorithm for venue suggestions
10. **Allocate Venue** - Hospitality allocates rooms and labs

### Phase 4: Verification & Cleanup
11. **Verify Allocation** - Event Team sees allocated venue in their dashboard
12. **Cleanup** - Deletes test event

## Expected Output

### Successful Test Run
```
🚀 Starting Complete Workflow Test

============================================================

🔐 Logging in all users...
✅ eventTeam logged in successfully
✅ treasurer logged in successfully
✅ genSec logged in successfully
✅ chairperson logged in successfully
✅ hospitality logged in successfully

📝 TEST 1: Creating Event...
✅ Event created successfully (ID: 507f1f77bcf86cd799439011)
   Status: DRAFT

🔍 TEST 2: Checking Schedule Conflicts...
✅ Schedule check completed
   Has Conflicts: False

📤 TEST 3: Submitting Event for Approval...
✅ Event submitted successfully
   Status: SUBMITTED

💰 TEST 4: Treasurer Approval...
✅ Treasurer approved event
   Status: TREASURER_APPROVED
   Registration Fee: ₹500

👔 TEST 5: General Secretary Approval...
✅ Gen Sec approved event
   Status: GENSEC_APPROVED

🎓 TEST 6: Chairperson Approval...
✅ Chairperson approved event
   Status: PUBLISHED

🏨 TEST 7: Hospitality Views Requirements...
✅ Event found in hospitality dashboard
   Expected Participants: 100
   Duration: 8 hours
   Type: Hackathon

✔️ TEST 8: Acknowledging Requirements...
✅ Requirements acknowledged

🤖 TEST 9: Auto-Generating Venue Suggestion...
✅ Venue suggestion generated
   Suggested Venue: Ada Lovelace Auditorium
   Venue Type: Auditorium
   Capacity: 150
   Utilization: 66.67%
   Priority Score: 5.23

🏢 TEST 10: Allocating Venue...
✅ Venue allocated successfully
   Allocated Rooms: 3
   Lab: Computer Lab 1, Computer Lab 2

🔍 TEST 11: Verifying Venue Allocation...
✅ Venue allocation verified in Event Team dashboard
   Allocated Rooms: 3
   Lab: Computer Lab 1, Computer Lab 2
   Venue Details: Room 101 (Computer Lab 1), Room 102 (Computer Lab 2), Room 201 (Conference Hall)

🧹 TEST 12: Cleaning Up Test Data...
✅ Test event deleted successfully

============================================================

📊 TEST SUMMARY
   Total Tests: 12
   Passed: 12
   Failed: 0
   Success Rate: 100.0%

✅ ALL TESTS PASSED! Workflow is working correctly.

============================================================
```

## Troubleshooting

### Test Fails at Login
- **Issue**: Users don't exist in database
- **Solution**: Create test users manually or through signup endpoints

### Test Fails at Event Creation
- **Issue**: Missing required fields or validation errors
- **Solution**: Check backend logs for specific error messages

### Test Fails at Approvals
- **Issue**: User doesn't have correct role/permissions
- **Solution**: Verify user roles in database match expected roles

### Test Fails at Venue Allocation
- **Issue**: Event not in correct status or hospitality endpoints not working
- **Solution**: Check backend logs and verify event status in database

### Schedule Conflict Check Returns Error
- **Issue**: Scheduling service not running or database query issues
- **Solution**: Check backend logs for scheduling service errors

### Auto-Generate Venue Returns No Suggestions
- **Issue**: No venues in database or no suitable venues for event type
- **Solution**: This is expected behavior if no venues exist. Add venues to database.

## Manual Testing

If automated tests fail, you can manually test through the UI:

1. **Login as Event Team** → Create event → Submit
2. **Login as Treasurer** → Approve event → Set fee
3. **Login as Gen Sec** → Approve event
4. **Login as Chairperson** → Approve event
5. **Login as Hospitality** → View requirements → Acknowledge → Allocate venue
6. **Login as Event Team** → View event details → Verify venue allocation

## Database Verification

You can verify the workflow by checking MongoDB directly:

```javascript
// Connect to MongoDB
use college_events

// Find the test event
db.events.findOne({ title: "Test Hackathon 2026" })

// Check status progression
// DRAFT → SUBMITTED → TREASURER_APPROVED → GENSEC_APPROVED → CHAIRPERSON_APPROVED → PUBLISHED

// Check hospitality section
// Should have: requirements_acknowledged, venue_allocated, allocated_rooms, lab_allocated, venue_details
```

## Customizing Tests

You can modify the test scripts to:

1. **Change test credentials**: Edit the `CREDENTIALS` object
2. **Change event data**: Modify the `event_data` in `test_create_event()`
3. **Add more tests**: Add new test functions and include them in the `tests` array
4. **Skip cleanup**: Comment out the `test_cleanup()` call to keep test data

## Notes

- Tests run sequentially with small delays between each test
- Each test depends on the previous test's success
- Test event is automatically deleted at the end (cleanup phase)
- If a test fails, subsequent tests may also fail due to dependencies
- Check backend console logs for detailed error messages

## Support

If tests continue to fail:
1. Check backend server logs
2. Verify MongoDB connection
3. Ensure all required collections exist
4. Verify user permissions and roles
5. Check API endpoint routes match expected paths
