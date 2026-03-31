# Event Creation to Venue Allocation Flow

## Complete Workflow Overview

This document outlines the complete flow from event creation by Event Team to venue allocation by Hospitality Team.

---

## Phase 1: Event Creation (Event Team)

### Step 1: Create Event Form
**Location**: EventTeamDashboard.jsx → "Create New Event"

**Required Fields**:
- Event Name *
- Description *
- Cover Photo (optional)
- Date * (must be future date)
- Time *
- Duration (hours) *
- Event Type * (Technical, Non-Technical, Hackathon, Seminar, Workshop)
- Event Tags (based on type)
- Expected Participants *
- Prize Pool Required (checkbox)
- Registration Fee Required (checkbox)

**Requirements Section**:
- Volunteers Needed (number)
- System Per Participant (checkbox)
- Internet Needed (checkbox)
- Judges Needed (checkbox + count)
- Refreshments Needed (checkbox + items selection)
- Stationary Needed (checkbox + items selection)
- Technical Items Needed (checkbox + items selection)
- Goodies Needed (checkbox)
- Physical Certificate (checkbox)
- Trophies Needed (checkbox)

### Step 2: Schedule Conflict Check (Optional but Recommended)
**Trigger**: When Date, Time, Duration, Event Type, and Expected Participants are filled

**Process**:
1. Click "Check Schedule Conflicts" button
2. System calls `/scheduling/check-conflict` endpoint
3. Backend checks for:
   - Time overlaps with existing events on same date
   - Venue availability based on type and capacity
4. Returns:
   - **No Conflicts**: Green card with success message
   - **Has Conflicts**: Red card showing:
     - Conflicting events with details
     - 3 suggested alternative time slots (9 AM - 6 PM)
     - Available venues for each suggestion
     - Clickable buttons to auto-fill suggested times

**Note**: User can still proceed with conflicting time - it's a warning, not a blocker.

### Step 3: Submit Event
**Action**: Click "Create Event" button

**Backend Process**:
1. Event saved with status: `DRAFT`
2. FormData includes all fields + cover photo
3. Requirements object stored in event document
4. Event appears in "My Events" list

### Step 4: Submit for Approval
**Action**: Click "Submit" button in My Events table

**Status Change**: `DRAFT` → `SUBMITTED`

---

## Phase 2: Approval Chain

### Treasurer Approval
- Reviews budget requirements
- Sets registration fee (if required)
- Approves/Rejects with comments
- Status: `SUBMITTED` → `TREASURER_APPROVED` or `REJECTED`

### General Secretary Approval
- Reviews overall event plan
- Approves/Rejects with comments
- Status: `TREASURER_APPROVED` → `GENSEC_APPROVED` or `REJECTED`

### Chairperson Approval
- Final approval authority
- Reviews all aspects
- Approves/Rejects with comments
- Status: `GENSEC_APPROVED` → `CHAIRPERSON_APPROVED` or `REJECTED`

### Publication
- After Chairperson approval
- Status: `CHAIRPERSON_APPROVED` → `PUBLISHED`
- Event becomes visible to participants

---

## Phase 3: Venue Allocation (Hospitality Team)

### Step 1: View Venue Requirements
**Location**: HospitalityDashboard.jsx → "View Requirements"

**Displays**:
- All events without venue allocation
- Event details:
  - Expected Participants
  - Duration (hours)
  - Event Type
  - Priority Score (if scheduling algorithm ran)

### Step 2: Acknowledge Requirements
**Action**: Click "Acknowledge Requirements" button

**Backend Process**:
1. POST `/hospitality/acknowledge/:eventId`
2. Sets `hospitality.requirements_acknowledged = true`
3. Event now ready for venue allocation

### Step 3: Auto-Generate Venue Suggestions (Optional)

#### Option A: Bulk Auto-Generate
**Location**: Top of Requirements view
**Button**: "Auto-Generate All (X)" where X = unallocated events count

**Process**:
1. Click button
2. POST `/scheduling/generate` with all unallocated event IDs
3. Backend runs scheduling algorithm:
   - **Interval Scheduling**: Detects time conflicts
   - **Priority Queue**: Calculates priority scores using formula:
     ```
     Priority = 0.3×participants + 0.25×prize + 0.2×fee + 0.15×duration + 0.1×type
     ```
   - **Graph Coloring**: Matches event types to venue types
     - Technical → Computer Lab, Classroom, Auditorium
     - Non-Technical → Auditorium, Classroom
     - Hackathon → Computer Lab
     - Seminar/Workshop → Classroom, Auditorium
   - **CSP (Constraint Satisfaction)**: Validates capacity constraints
4. Returns suggested venues with:
   - Venue name
   - Venue type
   - Capacity
   - Utilization percentage
   - Priority score
5. Suggestions stored in `event.scheduling.suggested_venue`
6. Priority score displayed in requirements view

#### Option B: Individual Auto-Generate
**Location**: Inside "Allocate Venue" form for specific event
**Section**: "Venue Suggestion" card

**Process**:
1. Click "Allocate Venue" for an event
2. In venue form, click "Auto-Generate Venue" button
3. POST `/scheduling/generate` with single event ID
4. Same algorithm as bulk (above)
5. Shows suggestion in cyan-colored card:
   - Suggested venue name
   - Type, Capacity, Utilization, Priority
6. Click "Accept Suggestion" to auto-fill venue details
7. Can modify before final submission

### Step 4: Manual Venue Allocation
**Location**: HospitalityDashboard.jsx → "Allocate Venue"

**Form Fields**:
- **Room Allocation** (dynamic list):
  - Room Number
  - Room Name
  - Add/Remove buttons
- **Lab Allocated** (text input)
- **Complete Venue Details** (textarea)

**Actions**:
- Add multiple rooms using "Add Room" button
- Remove rooms using "Remove" button
- Fill lab details if needed
- Provide complete venue summary

### Step 5: Submit Venue Allocation
**Action**: Click "Allocate Venue" button

**Backend Process**:
1. POST `/hospitality/venue/:eventId`
2. Saves:
   ```javascript
   hospitality: {
     requirements_acknowledged: true,
     venue_allocated: true,
     allocated_rooms: [{room_number, room_name}, ...],
     lab_allocated: "Lab name",
     venue_details: "Complete venue description",
     venue_allocated_at: Date.now()
   }
   ```
3. Event moves to "Allocated Venues" view

### Step 6: View Allocated Venues
**Location**: HospitalityDashboard.jsx → "Allocated Venues"

**Displays**:
- All events with venue allocation
- Shows:
  - Event title, type, date
  - Allocated rooms list
  - Lab allocated
  - Complete venue details
  - Allocation date
  - "Delete Allocation" button (if needed to redo)

---

## Phase 4: Event Team Visibility

### View Venue Allocation
**Location**: EventTeamDashboard.jsx → My Events → Event Details

**Venue Allocation Card Shows**:
- **Status**: Allocated (green) or Pending Allocation (orange)
- **Allocated Rooms**: List with room numbers and names
- **Lab**: Lab name if allocated
- **Complete Venue**: Full venue description

---

## Key Database Fields

### Event Schema - Hospitality Section
```javascript
hospitality: {
  requirements_acknowledged: Boolean,
  venue_allocated: Boolean,
  allocated_rooms: [{
    room_number: String,
    room_name: String
  }],
  lab_allocated: String,
  venue_details: String,
  venue_allocated_at: Date
}
```

### Event Schema - Scheduling Section
```javascript
scheduling: {
  suggested_venue: String,
  priority_score: Number,
  venue_type: String,
  venue_capacity: Number,
  utilization: Number
}
```

---

## API Endpoints Used

### Event Creation & Management
- `POST /events` - Create new event
- `GET /events` - Get user's events
- `PUT /events/:id/submit` - Submit for approval
- `DELETE /events/:id` - Delete event

### Schedule Conflict Check
- `POST /scheduling/check-conflict` - Check for time conflicts and suggest alternatives

### Venue Scheduling Algorithm
- `POST /scheduling/generate` - Generate venue suggestions (bulk or individual)
- `GET /scheduling/venues` - Get available venues list

### Hospitality Management
- `GET /hospitality/events` - Get all events for hospitality team
- `POST /hospitality/acknowledge/:eventId` - Acknowledge requirements
- `POST /hospitality/venue/:eventId` - Allocate venue
- `DELETE /hospitality/venue/:eventId` - Delete venue allocation

---

## Design Decisions

### 1. Non-Blocking Conflict Check
- Schedule conflict check is optional
- Shows warnings but allows proceeding
- Event Team maintains control over dates/times

### 2. Dual Venue Suggestion Approach
- **Bulk**: For efficient processing of multiple events
- **Individual**: For focused attention on single event
- Both use same algorithm, different UX

### 3. Manual Override Always Available
- Auto-suggestions can be accepted or ignored
- Hospitality team has final authority
- Can manually enter any venue details

### 4. Separation of Concerns
- Event Team: Creates events, sees venue allocation
- Hospitality Team: Acknowledges requirements, allocates venues
- No cross-modification of each other's data

### 5. Audit Trail
- `venue_allocated_at` timestamp
- Can delete and re-allocate if needed
- Event details show allocation status

---

## User Experience Flow

### Event Team Journey
1. Create Event → Fill all details → Check conflicts (optional) → Submit
2. Wait for approvals (Treasurer → Gen Sec → Chairperson)
3. Event published
4. View event details to see venue allocation status
5. See allocated rooms, labs, and complete venue details

### Hospitality Team Journey
1. View all events needing venue allocation
2. Acknowledge requirements for each event
3. Optionally run bulk auto-generate for all events
4. For each event:
   - Click "Allocate Venue"
   - Optionally click "Auto-Generate Venue" for suggestion
   - Accept suggestion or manually enter venue details
   - Add rooms, labs, complete venue description
   - Submit allocation
5. View all allocated venues
6. Can delete and re-allocate if needed

---

## Benefits of Current Implementation

1. **Flexibility**: Manual control with AI assistance
2. **Efficiency**: Bulk operations for multiple events
3. **Transparency**: Clear status visibility for both teams
4. **Safety**: Conflict warnings without blocking
5. **Auditability**: Timestamps and allocation history
6. **Scalability**: Handles multiple events simultaneously
7. **User-Friendly**: Clean UI with existing card styles
8. **Professional**: No emojis, consistent design language

---

## Future Enhancements (Potential)

1. Real-time venue availability calendar
2. Venue booking conflicts prevention
3. Email notifications on venue allocation
4. Venue capacity vs participants validation
5. Historical venue usage analytics
6. Venue preference learning from past allocations
7. Integration with campus facility management system
