QUICK START GUIDE - ENHANCED EVENT WORKFLOW
===========================================

## Prerequisites
✅ MongoDB installed and running
✅ Node.js installed
✅ All dependencies installed (npm install in both backend and frontend)

## Setup Steps

### 1. Start MongoDB
Make sure MongoDB is running on localhost:27017

### 2. Seed Database (if not already done)
```bash
cd backend
npm run seed              # Seed roles
npm run seed-users        # Seed test users
npm run seed-event-types  # Seed event types
```

### 3. Start Backend Server
```bash
cd backend
npm start
```
Backend will run on http://localhost:5000

### 4. Start Frontend Server
```bash
cd frontend
npm start
```
Frontend will run on http://localhost:3000

## Testing the Complete Workflow

### Step 1: Create Event (Event Team)
1. Go to http://localhost:3000/login
2. Login with: **event@test.com / event123**
3. Click "Create New Event"
4. Fill in the form:
   - Event Name: "Tech Hackathon 2024"
   - Date: Select future date
   - Time: "10:00"
   - Event Type: Select "Hackathon" (requirements auto-fill)
   - Expected Participants: 100
   - Prize Pool: 50000
   - Adjust requirements if needed
5. Click "Create Event"
6. Go to "View My Events"
7. Click "Submit" button to send for approval
8. Logout

### Step 2: Treasurer Approval
1. Login with: **treasurer@test.com / treasurer123**
2. You'll see the pending event in the table
3. Click "Review" button
4. Review all details including:
   - Prize distribution (₹25,000 / ₹15,000 / ₹10,000)
   - Requirements
5. Add comments: "Budget approved. Looks good!"
6. Click "Approve"
7. Logout

### Step 3: General Secretary Review
1. Login with: **gensec@test.com / gensec123**
2. Click "Review" on the pending event
3. View Treasurer's comments
4. Click "Edit Mode" if you want to modify:
   - Expected participants
   - Prize pool
   - Volunteer/room requirements
5. Add comments: "Increased volunteers to 12. Approved."
6. Click "Approve & Update" (or just "Approve")
7. Logout

### Step 4: Chairperson Final Approval
1. Login with: **chair@test.com / chair123**
2. Click "Review" on the pending event
3. Review complete details including:
   - All event information
   - Treasurer's comments
   - Gen Sec's comments
4. Add final comments: "Final approval granted. Event published."
5. Click "Approve & Publish"
6. Event is now PUBLISHED!
7. Logout

### Step 5: Verify Published Event
1. Login as any user
2. Go to Home page
3. Published event should be visible
4. Login as Admin to see all events and their statuses

## Test Credentials Quick Reference

| Role | Email | Password |
|------|-------|----------|
| Event Team | event@test.com | event123 |
| Treasurer | treasurer@test.com | treasurer123 |
| General Secretary | gensec@test.com | gensec123 |
| Chairperson | chair@test.com | chair123 |
| Admin | admin@test.com | admin123 |
| Student | student@test.com | student123 |

## Testing Rejection Flow

### Reject at Treasurer Level
1. Login as Event Team, create event, submit
2. Login as Treasurer
3. Add comments: "Budget too high. Please revise."
4. Click "Reject"
5. Event status → REJECTED

### Reject at Gen Sec Level
1. Follow approval through Treasurer
2. Login as Gen Sec
3. Add comments: "Requirements not feasible."
4. Click "Reject"
5. Event status → REJECTED

### Reject at Chairperson Level
1. Follow approval through Treasurer and Gen Sec
2. Login as Chairperson
3. Add comments: "Date conflicts with another event."
4. Click "Reject"
5. Event status → REJECTED

## Event Types Available

1. **Hackathon** - 10 volunteers, 2 rooms, all amenities
2. **Technical Workshop** - 5 volunteers, 1 room, basic amenities
3. **Quiz Competition** - 6 volunteers, 1 room, trophies included
4. **Cultural Event** - 15 volunteers, 1 room, goodies & trophies
5. **Sports Event** - 12 volunteers, 0 rooms, outdoor setup
6. **Seminar** - 4 volunteers, 1 room, minimal requirements
7. **Conference** - 20 volunteers, 3 rooms, full amenities

## Troubleshooting

### Backend not starting
- Check if MongoDB is running
- Check if port 5000 is available
- Run: `npm install` in backend folder

### Frontend not starting
- Check if port 3000 is available
- Run: `npm install` in frontend folder

### Login not working
- Verify backend is running
- Check browser console for errors
- Verify MongoDB has seeded users

### Events not showing
- Check network tab in browser
- Verify backend API is responding
- Check MongoDB has events collection

## API Testing with Postman/Thunder Client

### Get All Events
```
GET http://localhost:5000/events
Headers: Authorization: Bearer <token>
```

### Get Event Types
```
GET http://localhost:5000/events/types/all
Headers: Authorization: Bearer <token>
```

### Create Event
```
POST http://localhost:5000/events
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json
Body: {
  "title": "Test Event",
  "type": "Hackathon",
  "date": "2024-12-25",
  "time": "10:00",
  "expected_participants": 100,
  "prize_pool": 50000,
  "requirements": {
    "volunteers_needed": 10,
    "rooms_needed": 2,
    "refreshments_needed": true,
    "stationary_needed": true,
    "goodies_needed": true,
    "physical_certificate": true,
    "trophies_needed": true
  }
}
```

## Success Indicators

✅ Event Team can create and submit events
✅ Treasurer sees pending events and can approve/reject
✅ Gen Sec can edit and approve/reject
✅ Chairperson can do final approval and publish
✅ Published events visible to all users
✅ Comments preserved through workflow
✅ Status updates correctly at each stage
✅ Prize distribution calculated automatically
✅ Event types auto-fill requirements

## Next Features to Implement
- [ ] Requirement distribution to HR/Logistics/Hospitality
- [ ] Budget calculation and aggregation
- [ ] ML budget prediction
- [ ] Student registration
- [ ] GPS attendance
- [ ] Certificate generation
