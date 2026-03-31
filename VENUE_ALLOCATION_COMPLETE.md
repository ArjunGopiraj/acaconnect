# Complete Venue Allocation Logic, Algorithms & Flow

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Algorithms Used](#algorithms-used)
4. [Complete Flow](#complete-flow)
5. [Code Implementation](#code-implementation)
6. [Priority Scoring Formula](#priority-scoring-formula)
7. [Venue Matching Logic](#venue-matching-logic)
8. [Manual Override](#manual-override)

---

## Overview

The venue allocation system uses intelligent scheduling algorithms to automatically suggest optimal venues for events based on multiple factors including event type, capacity requirements, time conflicts, and venue availability.

### Key Features
- **Automatic Venue Suggestions**: AI-powered recommendations based on event requirements
- **Priority-Based Scheduling**: Events ranked by importance using weighted scoring
- **Conflict Detection**: Real-time detection of scheduling conflicts
- **Manual Override**: Hospitality team retains full control over final allocation
- **Bulk Operations**: Generate suggestions for all pending events at once

---

## System Architecture

```
┌─────────────────┐
│  Event Created  │
│  by Event Team  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Approval Chain                     │
│  1. Treasurer → Budget Approval     │
│  2. Gen Sec → Policy Review         │
│  3. Chairperson → Final Approval    │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Event Status: PUBLISHED            │
│  (Ready for Venue Allocation)       │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Hospitality Dashboard              │
│  - View all published events        │
│  - Auto-generate venue suggestions  │
│  - Manual venue allocation          │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Scheduling Algorithm               │
│  1. Calculate Priority Score        │
│  2. Check Time Conflicts            │
│  3. Match Venue Type & Capacity     │
│  4. Return Top Suggestion           │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Hospitality Team Decision          │
│  - Accept AI Suggestion             │
│  - Manually Select Different Venue  │
│  - Allocate Venue to Event          │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Venue Allocated                    │
│  - Event updated with venue details │
│  - Visible to all stakeholders      │
└─────────────────────────────────────┘
```

---

## Algorithms Used

### 1. **Priority Queue Algorithm**
**Purpose**: Rank events by importance to prioritize venue allocation

**Formula**:
```javascript
Priority Score = (0.3 × Participants) + (0.25 × Prize Pool) + 
                 (0.2 × Registration Fee) + (0.15 × Duration) + 
                 (0.1 × Event Type Weight)
```

**Event Type Weights**:
- Hackathon: 10
- Technical: 8
- Workshop: 7
- Seminar: 6
- Non-Technical: 5

**Example Calculation**:
```
Event: Hackathon with 100 participants, ₹5000 prize, ₹100 fee, 4 hours
Score = (0.3 × 100) + (0.25 × 5000/1000) + (0.2 × 100/100) + (0.15 × 4) + (0.1 × 10)
      = 30 + 1.25 + 0.2 + 0.6 + 1.0
      = 33.05
```

### 2. **Graph Coloring Algorithm**
**Purpose**: Match event types to compatible venue types

**Mapping Rules**:
```javascript
Technical Events → Computer Lab, Classroom, Auditorium
Non-Technical Events → Auditorium, Classroom, Seminar Hall
Hackathon → Computer Lab, Auditorium
Seminar → Seminar Hall, Auditorium, Classroom
Workshop → Classroom, Computer Lab, Seminar Hall
```

**Implementation**:
- Creates a bipartite graph between events and venues
- Edges exist only between compatible event-venue pairs
- Filters venues based on type compatibility

### 3. **Constraint Satisfaction Problem (CSP)**
**Purpose**: Ensure venue capacity meets event requirements

**Constraints**:
1. **Hard Constraint**: `venue.capacity >= event.expected_participants`
2. **Soft Constraint**: Prefer venues with capacity close to requirements (avoid waste)

**Scoring**:
```javascript
if (venue.capacity < event.expected_participants) {
  // Reject - hard constraint violated
  return null;
}

// Calculate capacity utilization score
utilizationScore = event.expected_participants / venue.capacity;
// Prefer 70-90% utilization (sweet spot)
```

### 4. **Interval Scheduling Algorithm**
**Purpose**: Detect time conflicts between events

**Logic**:
```javascript
// Two events conflict if their time intervals overlap
Event A: [startA, endA]
Event B: [startB, endB]

Conflict exists if:
  (startA < endB) AND (endA > startB)
```

**Implementation**:
```javascript
const eventStart = new Date(`${event.date}T${event.time}`);
const eventEnd = new Date(eventStart.getTime() + event.duration_hours * 60 * 60 * 1000);

const existingStart = new Date(`${existing.date}T${existing.time}`);
const existingEnd = new Date(existingStart.getTime() + existing.duration_hours * 60 * 60 * 1000);

const hasConflict = (eventStart < existingEnd) && (eventEnd > existingStart);
```

---

## Complete Flow

### Phase 1: Event Creation & Approval
```
1. Event Team creates event with:
   - Title, Type, Description
   - Date, Time, Duration
   - Expected Participants
   - Requirements (volunteers, refreshments, etc.)

2. Event goes through approval chain:
   - Treasurer: Sets budget, prize pool, registration fee
   - Gen Sec: Reviews policy compliance
   - Chairperson: Final approval → Status: PUBLISHED

3. Published events appear in Hospitality Dashboard
```

### Phase 2: Venue Suggestion Generation
```
1. Hospitality team clicks "Auto-Generate Venue" for an event

2. Backend receives request at POST /scheduling/suggest-venue
   Request body: { eventId }

3. Scheduling Service (scheduling.service.js):
   
   a) Fetch event details from database
   
   b) Calculate Priority Score:
      - Extract: participants, prize_pool, registration_fee, duration, type
      - Apply weighted formula
      - Store score in event.scheduling.priority_score
   
   c) Fetch all venues from database
   
   d) Filter venues by type compatibility (Graph Coloring):
      - Match event.type to compatible venue types
      - Remove incompatible venues
   
   e) Filter venues by capacity (CSP):
      - Keep only venues where capacity >= expected_participants
      - Calculate utilization score for each
   
   f) Check time conflicts (Interval Scheduling):
      - Query all events on same date
      - For each venue, check if any event conflicts
      - Mark venues as available/unavailable
   
   g) Score and rank venues:
      - Combine: type match + capacity utilization + availability
      - Sort by total score (descending)
   
   h) Return top suggestion with priority score

4. Frontend displays suggestion in Hospitality Dashboard:
   - Venue name and type
   - Priority Score
   - "Accept Suggestion" button
```

### Phase 3: Venue Allocation
```
Option A: Accept AI Suggestion
1. Hospitality clicks "Accept Suggestion"
2. Frontend sends PUT /events/:id/allocate-venue
   Body: { venue_id, venue_details }
3. Backend updates event:
   - hospitality.venue_allocated = true
   - hospitality.venue_details = venue name
   - hospitality.allocated_rooms = [venue info]
4. Success message displayed

Option B: Manual Selection
1. Hospitality clicks "Allocate Venue Manually"
2. Dropdown shows all available venues
3. Hospitality selects venue
4. Same allocation process as Option A

Option C: Bulk Generation
1. Hospitality clicks "Auto-Generate All"
2. Frontend sends POST /scheduling/suggest-all-venues
3. Backend processes all published events without venues
4. Generates suggestions for each event
5. Returns array of event-venue pairs
6. Frontend displays all suggestions
7. Hospitality can accept/reject each individually
```

### Phase 4: Verification & Display
```
1. Allocated venues visible in:
   - Hospitality Dashboard (with edit option)
   - Event Team Dashboard (read-only)
   - Chairperson Dashboard (read-only)
   - Student Dashboard (when browsing events)

2. Event details show:
   - Venue name
   - Room numbers (if applicable)
   - Lab allocation (if applicable)
   - Complete venue details string
```

---

## Code Implementation

### Backend: Scheduling Service
**File**: `backend/src/services/scheduling.service.js`

```javascript
class SchedulingService {
  
  // Calculate priority score for an event
  calculatePriority(event) {
    const typeWeights = {
      'Hackathon': 10,
      'Technical': 8,
      'Workshop': 7,
      'Seminar': 6,
      'Non-Technical': 5
    };
    
    const participants = event.expected_participants || 0;
    const prizePool = (event.prize_pool || 0) / 1000; // Normalize
    const regFee = (event.registration_fee || 0) / 100; // Normalize
    const duration = event.duration_hours || 0;
    const typeWeight = typeWeights[event.type] || 5;
    
    const score = (0.3 * participants) + 
                  (0.25 * prizePool) + 
                  (0.2 * regFee) + 
                  (0.15 * duration) + 
                  (0.1 * typeWeight);
    
    return parseFloat(score.toFixed(2));
  }
  
  // Suggest optimal venue for an event
  async suggestVenue(eventId) {
    // 1. Fetch event
    const event = await Event.findById(eventId);
    
    // 2. Calculate priority
    const priorityScore = this.calculatePriority(event);
    await Event.findByIdAndUpdate(eventId, {
      'scheduling.priority_score': priorityScore
    });
    
    // 3. Fetch all venues
    const venues = await Venue.find();
    
    // 4. Filter by type (Graph Coloring)
    const compatibleVenues = this.filterByType(event.type, venues);
    
    // 5. Filter by capacity (CSP)
    const suitableVenues = compatibleVenues.filter(v => 
      v.capacity >= event.expected_participants
    );
    
    // 6. Check conflicts (Interval Scheduling)
    const availableVenues = await this.filterByAvailability(
      event.date, 
      event.time, 
      event.duration_hours, 
      suitableVenues
    );
    
    // 7. Score and rank
    const scoredVenues = availableVenues.map(venue => ({
      venue,
      score: this.scoreVenue(venue, event)
    }));
    
    scoredVenues.sort((a, b) => b.score - a.score);
    
    // 8. Return top suggestion
    return {
      venue: scoredVenues[0]?.venue || null,
      priorityScore,
      alternativeVenues: scoredVenues.slice(1, 4)
    };
  }
  
  // Filter venues by event type compatibility
  filterByType(eventType, venues) {
    const typeMapping = {
      'Technical': ['Computer Lab', 'Classroom', 'Auditorium'],
      'Non-Technical': ['Auditorium', 'Classroom', 'Seminar Hall'],
      'Hackathon': ['Computer Lab', 'Auditorium'],
      'Seminar': ['Seminar Hall', 'Auditorium', 'Classroom'],
      'Workshop': ['Classroom', 'Computer Lab', 'Seminar Hall']
    };
    
    const compatibleTypes = typeMapping[eventType] || [];
    return venues.filter(v => compatibleTypes.includes(v.type));
  }
  
  // Check venue availability (no time conflicts)
  async filterByAvailability(date, time, duration, venues) {
    const eventStart = new Date(`${date}T${time}`);
    const eventEnd = new Date(eventStart.getTime() + duration * 3600000);
    
    const eventsOnDate = await Event.find({
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59, 999)
      },
      'hospitality.venue_allocated': true
    });
    
    return venues.filter(venue => {
      // Check if venue has any conflicting events
      const hasConflict = eventsOnDate.some(existingEvent => {
        // Check if this venue is allocated to the existing event
        const isVenueAllocated = existingEvent.hospitality.allocated_rooms?.some(
          room => room.room_number === venue.room_number
        );
        
        if (!isVenueAllocated) return false;
        
        // Check time overlap
        const existingStart = new Date(`${existingEvent.date}T${existingEvent.time}`);
        const existingEnd = new Date(existingStart.getTime() + existingEvent.duration_hours * 3600000);
        
        return (eventStart < existingEnd) && (eventEnd > existingStart);
      });
      
      return !hasConflict;
    });
  }
  
  // Score venue based on capacity utilization
  scoreVenue(venue, event) {
    const utilization = event.expected_participants / venue.capacity;
    
    // Prefer 70-90% utilization
    if (utilization >= 0.7 && utilization <= 0.9) {
      return 10;
    } else if (utilization >= 0.5 && utilization < 0.7) {
      return 8;
    } else if (utilization > 0.9 && utilization <= 1.0) {
      return 7;
    } else {
      return 5;
    }
  }
  
  // Check for schedule conflicts
  async checkScheduleConflict(date, time, duration, type, participants, prizePool, regFee) {
    // Query events on same date
    const dateObj = new Date(date);
    const eventsOnDate = await Event.find({
      date: {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lt: new Date(dateObj.setHours(23, 59, 59, 999))
      },
      status: 'PUBLISHED'
    });
    
    // Check time conflicts
    const eventStart = new Date(`${date}T${time}`);
    const eventEnd = new Date(eventStart.getTime() + duration * 3600000);
    
    const conflicts = eventsOnDate.filter(existing => {
      const existingStart = new Date(`${existing.date.toISOString().split('T')[0]}T${existing.time}`);
      const existingEnd = new Date(existingStart.getTime() + existing.duration_hours * 3600000);
      
      return (eventStart < existingEnd) && (eventEnd > existingStart);
    });
    
    // Calculate priority for new event
    const newEventPriority = this.calculatePriority({
      expected_participants: participants,
      prize_pool: prizePool,
      registration_fee: regFee,
      duration_hours: duration,
      type: type
    });
    
    // Suggest alternative times
    const suggestions = this.suggestAlternativeTimes(date, time, duration, eventsOnDate);
    
    return {
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts.map(c => ({
        title: c.title,
        type: c.type,
        time: c.time,
        duration: c.duration_hours
      })),
      newEventPriority,
      suggestions
    };
  }
  
  // Suggest alternative time slots
  suggestAlternativeTimes(date, originalTime, duration, existingEvents) {
    const suggestions = [];
    const timeSlots = ['09:00', '11:00', '13:00', '15:00', '17:00'];
    
    for (const slot of timeSlots) {
      if (slot === originalTime) continue;
      
      const slotStart = new Date(`${date}T${slot}`);
      const slotEnd = new Date(slotStart.getTime() + duration * 3600000);
      
      // Check if this slot conflicts
      const hasConflict = existingEvents.some(existing => {
        const existingStart = new Date(`${existing.date.toISOString().split('T')[0]}T${existing.time}`);
        const existingEnd = new Date(existingStart.getTime() + existing.duration_hours * 3600000);
        
        return (slotStart < existingEnd) && (slotEnd > existingStart);
      });
      
      if (!hasConflict) {
        // Count available venues for this slot
        const availableVenues = 10; // Simplified
        
        suggestions.push({
          time: slot,
          reason: 'No conflicts',
          availableVenues
        });
      }
      
      if (suggestions.length >= 3) break;
    }
    
    return suggestions;
  }
}
```

### Backend: Routes
**File**: `backend/src/routes/scheduling.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const schedulingController = require('../controllers/scheduling.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Suggest venue for a single event
router.post('/suggest-venue', 
  authenticate, 
  authorize(['HOSPITALITY']), 
  schedulingController.suggestVenue
);

// Suggest venues for all events (bulk)
router.post('/suggest-all-venues', 
  authenticate, 
  authorize(['HOSPITALITY']), 
  schedulingController.suggestAllVenues
);

// Check schedule conflicts (for Event Team)
router.post('/check-conflict', 
  authenticate, 
  authorize(['EVENT_TEAM']), 
  schedulingController.checkScheduleConflict
);

module.exports = router;
```

### Frontend: Hospitality Dashboard
**File**: `frontend/src/dashboards/HospitalityDashboard.jsx`

**Key Functions**:

```javascript
// Generate venue suggestion for single event
const handleGenerateVenue = async (eventId) => {
  try {
    const res = await axios.post('/scheduling/suggest-venue', { eventId });
    
    setVenueSuggestions(prev => ({
      ...prev,
      [eventId]: {
        venue: res.data.venue,
        priorityScore: res.data.priorityScore
      }
    }));
    
    alert('Venue suggestion generated!');
  } catch (error) {
    alert('Failed to generate venue suggestion');
  }
};

// Accept AI suggestion
const handleAcceptSuggestion = async (eventId) => {
  const suggestion = venueSuggestions[eventId];
  if (!suggestion?.venue) return;
  
  try {
    await axios.put(`/events/${eventId}/allocate-venue`, {
      venue_id: suggestion.venue._id,
      venue_details: `${suggestion.venue.room_name} (${suggestion.venue.room_number})`
    });
    
    alert('Venue allocated successfully!');
    fetchEvents();
  } catch (error) {
    alert('Failed to allocate venue');
  }
};

// Manual venue allocation
const handleAllocateVenue = async (eventId, venueId) => {
  const venue = venues.find(v => v._id === venueId);
  
  try {
    await axios.put(`/events/${eventId}/allocate-venue`, {
      venue_id: venueId,
      venue_details: `${venue.room_name} (${venue.room_number})`
    });
    
    alert('Venue allocated successfully!');
    fetchEvents();
  } catch (error) {
    alert('Failed to allocate venue');
  }
};

// Bulk generation
const handleGenerateAllVenues = async () => {
  try {
    const res = await axios.post('/scheduling/suggest-all-venues');
    
    const newSuggestions = {};
    res.data.suggestions.forEach(item => {
      newSuggestions[item.eventId] = {
        venue: item.venue,
        priorityScore: item.priorityScore
      };
    });
    
    setVenueSuggestions(newSuggestions);
    alert(`Generated suggestions for ${res.data.suggestions.length} events!`);
  } catch (error) {
    alert('Failed to generate venue suggestions');
  }
};
```

---

## Priority Scoring Formula

### Weights Explanation

| Factor | Weight | Reasoning |
|--------|--------|-----------|
| **Participants** | 30% | Largest impact on venue capacity requirements |
| **Prize Pool** | 25% | Indicates event importance and prestige |
| **Registration Fee** | 20% | Shows revenue generation potential |
| **Duration** | 15% | Longer events need more resources |
| **Event Type** | 10% | Technical events often need specialized venues |

### Score Ranges

- **High Priority (30+)**: Large hackathons, major technical events
- **Medium Priority (15-30)**: Regular workshops, seminars
- **Low Priority (<15)**: Small events, informal gatherings

---

## Venue Matching Logic

### Type Compatibility Matrix

| Event Type | Compatible Venues |
|------------|-------------------|
| Technical | Computer Lab, Classroom, Auditorium |
| Non-Technical | Auditorium, Classroom, Seminar Hall |
| Hackathon | Computer Lab, Auditorium |
| Seminar | Seminar Hall, Auditorium, Classroom |
| Workshop | Classroom, Computer Lab, Seminar Hall |

### Capacity Matching

```
Optimal Utilization: 70-90%
Acceptable: 50-100%
Rejected: <50% or >100%
```

### Conflict Resolution

```
If venue has time conflict:
  1. Mark as unavailable
  2. Suggest next best venue
  3. Or suggest alternative time slot
```

---

## Manual Override

Hospitality team can always:
1. **Reject AI suggestion** and select different venue
2. **Edit allocated venue** after allocation
3. **Override capacity constraints** with justification
4. **Allocate same venue to multiple events** if times don't conflict

This ensures human judgment remains the final authority while AI provides intelligent assistance.

---

## Summary

The venue allocation system combines multiple algorithms:
- **Priority Queue** for importance ranking
- **Graph Coloring** for type matching
- **CSP** for capacity constraints
- **Interval Scheduling** for conflict detection

This creates an intelligent, automated system that:
✅ Saves time for Hospitality team
✅ Optimizes venue utilization
✅ Prevents scheduling conflicts
✅ Maintains human control and flexibility
