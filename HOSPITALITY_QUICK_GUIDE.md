# Hospitality Team - Quick Reference Guide
## AI-Powered Venue Allocation

---

## 🚀 Quick Start

### Method 1: Bulk Auto-Generate (For Multiple Events)
```
Dashboard → View Requirements → Click "🎯 Auto-Generate All"
```
**Best for**: Scheduling all events at once at the start of semester

### Method 2: Individual Auto-Generate (For Single Event)
```
Dashboard → View Requirements → Allocate Venue → Click "🎯 Auto-Generate Venue"
```
**Best for**: Adding new events or re-scheduling individual events

### Method 3: Manual Allocation (Traditional)
```
Dashboard → View Requirements → Allocate Venue → Fill form manually
```
**Best for**: Special cases or when you want full manual control

---

## 📋 Step-by-Step Instructions

### Bulk Scheduling All Events

1. **Login** to ACACONNECT as Hospitality team member

2. **Navigate** to Dashboard
   - Click "📊 Dashboard" button in header

3. **View Requirements**
   - Click "View Requirements" button

4. **Auto-Generate**
   - Click "🎯 Auto-Generate All (X)" button
   - Wait for processing (usually 2-5 seconds)

5. **Review Results**
   - Alert shows: "✅ Bulk scheduling complete! Successful: X, Failed: Y"
   - Failed events usually mean capacity exceeded or time conflicts

6. **Allocate Venues**
   - Click "Allocate Venue" on each event
   - Review AI suggestion (shown in golden box)
   - Click "✅ Accept Suggestion" or modify manually
   - Click "Allocate Venue" to submit

---

### Individual Event Scheduling

1. **Navigate** to View Requirements

2. **Select Event**
   - Click "Allocate Venue" on the event card

3. **Auto-Generate**
   - Click "🎯 Auto-Generate Venue" button
   - Wait 1-2 seconds

4. **Review Suggestion**
   - Green box shows:
     - 📍 Suggested venue name
     - Type (Classroom/Lab/Auditorium)
     - Capacity
     - Utilization % (how full the venue will be)
     - Priority score

5. **Accept or Modify**
   - **Option A**: Click "✅ Accept Suggestion"
     - Form auto-fills with venue details
     - You can still modify before submitting
   
   - **Option B**: Ignore suggestion and fill manually
     - Type your own venue details

6. **Submit**
   - Click "Allocate Venue" button at bottom
   - Confirmation message appears

---

## 🎯 Understanding AI Suggestions

### Priority Score (0-10)
- **8-10**: High priority (large events, high prize pool)
- **5-7**: Medium priority (standard events)
- **2-4**: Low priority (small events, low budget)

### Utilization Percentage
- **80-100%**: Optimal usage (venue well-matched)
- **60-79%**: Good usage (slight over-capacity)
- **40-59%**: Acceptable (room for growth)
- **<40%**: Under-utilized (consider smaller venue)

### Venue Types
- **Computer Lab**: Technical events, coding competitions, hackathons
- **Classroom**: Workshops, seminars, small-medium events
- **Auditorium**: Large events, presentations, 100+ participants
- **Conference Room**: Small meetings, 10-15 people

---

## ✅ What the Algorithm Considers

1. **Capacity Match**
   - Ensures venue can fit all expected participants
   - Adds 10% buffer for safety

2. **Event Type Match**
   - Technical events → Computer Labs preferred
   - Non-Technical → Classrooms/Auditorium
   - Workshops → Flexible (Labs or Classrooms)

3. **Time Conflicts**
   - Prevents double-booking
   - Checks date and time overlaps

4. **Priority**
   - High-value events get first choice
   - Based on participants, prize pool, fees

---

## 🏢 Available Venues

### Classrooms (4 venues)
- G3 Ground Floor: 60 capacity
- F1 First Floor: 60 capacity
- S2 Second Floor: 60 capacity
- T3 Third Floor: 40 capacity

### Computer Labs (5 venues)
- First Floor Lab: 72 capacity
- Second Floor Lab: 72 capacity
- Third Floor Lab: 72 capacity
- Second Floor Annexure Lab: 30 capacity
- Third Floor Annexure Lab: 30 capacity

### Special Venues
- Ada Lovelace Auditorium: 150 capacity (large events)
- Conference Hall: 15 capacity (small meetings)

---

## ⚠️ Common Issues & Solutions

### Issue: "No suitable venue available"
**Causes**:
- Event capacity exceeds all venues (>150 participants)
- Time conflict with another event
- Event type doesn't match available venues

**Solutions**:
- Split event into multiple sessions
- Change event date/time
- Request external venue
- Manually override with creative solution

### Issue: Multiple events want same venue
**Solution**:
- Algorithm assigns by priority automatically
- Lower priority events get alternative venues
- You can manually override if needed

### Issue: AI suggests wrong venue type
**Solution**:
- Ignore suggestion
- Fill form manually with correct venue
- System allows full manual override

---

## 💡 Pro Tips

1. **Run bulk scheduling early** in the semester to catch conflicts

2. **Review high-priority events first** (they get best venues)

3. **Check utilization %** - if <50%, consider smaller venue to save resources

4. **Manual override is always available** - AI is a suggestion, not a requirement

5. **Time conflicts are automatic** - algorithm prevents double-booking

6. **Update event details before scheduling** - accurate participant count = better suggestions

---

## 🆘 Need Help?

### Contact:
- **Technical Issues**: IT Support / TECHOPS team
- **Venue Questions**: General Secretary
- **Algorithm Issues**: Development Team

### Documentation:
- Full documentation: `SCHEDULING_INTEGRATION.md`
- API documentation: `backend/src/routes/scheduling.routes.js`

---

## 📊 Example Workflow

**Scenario**: 5 new events need venues

1. Login → Dashboard → View Requirements
2. Click "🎯 Auto-Generate All (5)"
3. Wait 3 seconds
4. Alert: "✅ Successful: 5, Failed: 0"
5. Review each event:
   - Event A: Accept AI suggestion → Submit
   - Event B: Modify venue name → Submit
   - Event C: Accept AI suggestion → Submit
   - Event D: Ignore AI, manual entry → Submit
   - Event E: Accept AI suggestion → Submit
6. Done! All venues allocated in <5 minutes

**Time Saved**: 80% compared to manual allocation

---

**Remember**: The AI is your assistant, not your boss. You always have final say! 🎉
