# Real-Time Schedule Conflict Detection

## Overview
Event Team can now check for scheduling conflicts in real-time when creating events. The system uses 3 scheduling algorithms to detect conflicts and suggest optimal alternative times.

## How It Works

### For Event Team
1. **Create Event** → Fill in Date, Time, Duration, Event Type, Expected Participants
2. **Check Schedule** → Click "🔍 Check Schedule Conflicts" button
3. **View Results** → System shows:
   - ✅ **No Conflicts**: Proceed with event creation
   - ⚠️ **Conflicts Detected**: View conflicting events + suggested alternative times
4. **Choose Action**:
   - Accept suggested time (click on suggestion)
   - Proceed with original time anyway
   - Modify time manually

### Algorithms Used

#### 1. **Interval Scheduling (Conflict Detection)**
- Checks if new event overlaps with existing published events
- Compares time intervals: `[start, end]` vs `[existing_start, existing_end]`
- Detects conflicts on same date

#### 2. **Priority Queue (Alternative Time Suggestions)**
- Calculates priority score for new event
- Formula: `0.3×participants + 0.25×prize + 0.2×fee + 0.15×duration + 0.1×type`
- Suggests top 3 available time slots (9 AM - 6 PM)

#### 3. **Graph Coloring + CSP (Venue Matching)**
- Filters suitable venues by event type:
  - Technical → Computer Lab, Classroom, Auditorium
  - Non-Technical → Classroom, Auditorium
  - Hackathon → Computer Lab, Classroom
  - Workshop → Classroom, Computer Lab, Auditorium
- Ensures venue capacity ≥ expected participants
- Shows number of available venues for each suggested time

## API Endpoint

### POST `/api/scheduling/check-conflict`

**Request Body:**
```json
{
  "date": "2026-03-15",
  "time": "14:00",
  "duration_hours": 2,
  "type": "Technical",
  "expected_participants": 50,
  "prize_pool": 5000,
  "registration_fee": 0
}
```

**Response (No Conflicts):**
```json
{
  "success": true,
  "hasConflicts": false,
  "conflicts": [],
  "suggestions": [],
  "canProceed": true
}
```

**Response (Conflicts Found):**
```json
{
  "success": true,
  "hasConflicts": true,
  "conflicts": [
    {
      "title": "Coding Competition",
      "time": "14:00",
      "duration": 3,
      "type": "Technical"
    }
  ],
  "suggestions": [
    {
      "time": "10:00",
      "priority": 7.5,
      "availableVenues": 3,
      "reason": "No conflicts, suitable venues available"
    },
    {
      "time": "11:00",
      "priority": 7.5,
      "availableVenues": 3,
      "reason": "No conflicts, suitable venues available"
    }
  ],
  "canProceed": true
}
```

## UI Features

### Check Schedule Button
- Appears after filling: Date, Time, Duration, Event Type, Expected Participants
- Shows loading state: "⏳ Checking..."
- Resets automatically when date/time/duration changes

### Conflict Warning (Red Box)
- Lists all conflicting events with details
- Shows suggested alternative times
- Click suggestion to auto-fill time field
- Note: "You can still proceed with your chosen time"

### No Conflict Success (Green Box)
- Confirms time slot is available
- Encourages proceeding with event creation

## Key Design Decisions

### ✅ Event Team Maintains Control
- Algorithm only **suggests**, never **forces**
- Event Team can override suggestions
- Respects external constraints (speaker availability, etc.)

### ✅ Zero Breaking Changes
- Optional feature (button only appears when fields filled)
- All existing functionality works unchanged
- No modifications to existing routes or workflows

### ✅ Hospitality Authority Unchanged
- Venue allocation still handled by Hospitality team
- Algorithm only checks time conflicts, not venue conflicts
- Hospitality can accept/modify/override venue suggestions separately

## Files Modified

### Backend
1. **scheduling.service.js** - Added `checkScheduleConflict()` method
2. **scheduling.controller.js** - Added `checkScheduleConflict` endpoint
3. **scheduling.routes.js** - Added `POST /check-conflict` route

### Frontend
1. **EventTeamDashboard.jsx** - Added:
   - `scheduleCheck` state
   - `checkingSchedule` state
   - `handleCheckSchedule()` function
   - Schedule check UI component
   - Auto-reset on date/time/duration change

## Testing

### Test Case 1: No Conflicts
1. Create event for March 15, 2026 at 10:00 AM (2 hours)
2. Click "Check Schedule Conflicts"
3. Expected: ✅ Green box "No Conflicts Found"

### Test Case 2: Conflict Detected
1. Create event for same date/time as existing published event
2. Click "Check Schedule Conflicts"
3. Expected: ⚠️ Red box with conflicting event details + 3 alternative times

### Test Case 3: Accept Suggestion
1. Detect conflict
2. Click on suggested time (e.g., "11:00")
3. Expected: Time field updates to 11:00, check resets

### Test Case 4: Manual Override
1. Detect conflict
2. Ignore suggestions, proceed with original time
3. Expected: Event creates successfully (no blocking)

## Benefits

1. **Proactive Conflict Prevention** - Catches issues before submission
2. **Intelligent Suggestions** - Algorithm recommends optimal times
3. **User-Friendly** - Simple button, clear visual feedback
4. **Non-Intrusive** - Optional feature, doesn't block workflow
5. **Professional** - Shows system intelligence without forcing decisions

## Future Enhancements (Optional)

- Auto-check on date/time change (without button click)
- Show venue availability in real-time
- Suggest alternative dates (not just times)
- Email notifications for conflicts
- Calendar view of all events
