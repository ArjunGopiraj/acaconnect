# View Participants Feature - Implementation Guide

## ✅ COMPLETED:
1. **Backend API** - Added `/registrations/events/:eventId/participants` endpoint
2. **ParticipantsModal Component** - Created reusable modal component
3. **EventTeamDashboard** - Added "View Participants" button for published events

## 📋 TODO - Add to Remaining Dashboards:

### 1. TreasurerDashboard.jsx
**Location**: In the approved events table
**Steps**:
1. Import ParticipantsModal: `import ParticipantsModal from '../components/ParticipantsModal';`
2. Add state: `const [showParticipants, setShowParticipants] = useState(false);`
3. Add button in Actions column for approved/published events
4. Add modal at the end of return statement

### 2. GeneralSecretaryDashboard.jsx / GenSecDashboard.jsx
**Location**: In the events table
**Steps**:
1. Import ParticipantsModal
2. Add state for modal
3. Add "View Participants" button for approved/published events
4. Add modal rendering

### 3. ChairpersonDashboard.jsx
**Location**: In the events table
**Steps**:
1. Import ParticipantsModal
2. Add state for modal
3. Add "View Participants" button for all events (they can see all)
4. Add modal rendering

## Code Snippets:

### Import Statement:
```javascript
import ParticipantsModal from '../components/ParticipantsModal';
```

### State:
```javascript
const [selectedEventForParticipants, setSelectedEventForParticipants] = useState(null);
```

### Button (add to Actions column):
```javascript
<button 
  className="btn btn-primary"
  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
  onClick={() => setSelectedEventForParticipants(event)}
>
  👥 View Participants
</button>
```

### Modal (add before closing div in return):
```javascript
{selectedEventForParticipants && (
  <ParticipantsModal 
    event={selectedEventForParticipants} 
    onClose={() => setSelectedEventForParticipants(null)} 
  />
)}
```

## Files Modified:
✅ backend/src/routes/registration.routes.js
✅ backend/src/controllers/registration.controller.js
✅ frontend/src/components/ParticipantsModal.jsx (NEW)
✅ frontend/src/dashboards/EventTeamDashboard.jsx

## Files to Modify:
- frontend/src/dashboards/TreasurerDashboard.jsx
- frontend/src/dashboards/GeneralSecretaryDashboard.jsx
- frontend/src/dashboards/GenSecDashboard.jsx
- frontend/src/dashboards/ChairpersonDashboard.jsx

## Testing:
1. Create an event as Event Team
2. Submit and approve through workflow
3. Publish the event
4. Register as a participant
5. Check "View Participants" button in each dashboard
6. Verify participant list shows correctly

## Features in ParticipantsModal:
- Shows total participant count
- Displays participant details (name, email, college)
- Shows registration date
- Shows attendance status (PRESENT/ABSENT/PENDING)
- Responsive table design
- Close button and click-outside-to-close functionality
