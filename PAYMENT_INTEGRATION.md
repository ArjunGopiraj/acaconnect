# Registration Fee Integration - Manual Steps

## Frontend Integration Complete ✅

### Files Modified:
1. ✅ ParticipantHomePage.jsx - Shows registration fees on event cards
2. ✅ PaymentModal.jsx - NEW - Handles payment flow
3. ⏳ EventTeamDashboard.jsx - NEEDS MANUAL UPDATE

### To Add Registration Fee to Event Creation Form:

In EventTeamDashboard.jsx, find the Prize Pool input field and add this AFTER it:

```jsx
{/* Registration Fee */}
<div className="form-group">
  <label className="form-label">Registration Fee (₹)</label>
  <input
    type="number"
    className="form-input"
    placeholder="Enter registration fee (0 for free events)"
    value={formData.registration_fee || 0}
    onChange={(e) => setFormData({...formData, registration_fee: parseInt(e.target.value) || 0})}
    min="0"
  />
  <small style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
    Set to 0 for free events. Participants will pay this amount during registration.
  </small>
</div>
```

Also add to formData initial state:
```jsx
registration_fee: 0
```

## Backend Integration Complete ✅

### Files Created/Modified:
1. ✅ Events.js model - Added registration_fee field
2. ✅ Registration.js model - NEW - Tracks registrations and payments
3. ✅ registration.controller.js - NEW - Registration and payment logic
4. ✅ registration.routes.js - NEW - API endpoints
5. ✅ server.js - Mounted registration routes
6. ✅ updateEventFees.js - Script to add fees to existing events

### Run This to Update Existing Events:
```bash
cd backend
node updateEventFees.js
```

This will set:
- FREE (₹0): Treasure Hunt, Anime/Cinema Quiz, Photography Contest
- ₹50: Non-Technical events
- ₹100: Technical events
- ₹150: Workshops/Seminars
- ₹200: Hackathons

## Testing the Payment System

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Run fee update script: `cd backend && node updateEventFees.js`
4. Login as participant
5. Go to Events tab
6. Click "Register Now" on any event
7. Payment modal will show:
   - Event details
   - Registration fee (or FREE)
   - Pay Now / Register button
8. Click button to complete mock payment
9. Success message with payment ID

## API Endpoints

- POST /registrations/events/:eventId/register - Register for event
- POST /registrations/registrations/:registrationId/pay - Process payment
- GET /registrations/my-registrations - Get participant's registrations
- GET /registrations/events/:eventId/check - Check registration status

## Mock Payment System

- No external API required
- Generates mock payment IDs: MOCK_timestamp_randomstring
- Stores payment records in database
- Ready to switch to Razorpay later

## Next Steps

1. Add registration fee field to event creation form (manual step above)
2. Create "My Registrations" page to show registered events
3. Add payment history view
4. Later: Switch to Razorpay for real payments
