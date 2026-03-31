const Event = require('../models/Events');
const Venue = require('../models/Venue');
const Volunteer = require('../models/Volunteer');

// Priority Queue Implementation
class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  push(event, priority) {
    this.heap.push({ event, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.bubbleDown(0);
    }
    return top;
  }

  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].priority >= this.heap[index].priority) break;
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  bubbleDown(index) {
    while (true) {
      let largest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < this.heap.length && this.heap[left].priority > this.heap[largest].priority) {
        largest = left;
      }
      if (right < this.heap.length && this.heap[right].priority > this.heap[largest].priority) {
        largest = right;
      }
      if (largest === index) break;

      [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
      index = largest;
    }
  }

  isEmpty() {
    return this.heap.length === 0;
  }
}

class SchedulingService {
  
  // Calculate priority score for event
  calculatePriority(event) {
    const eventTypeWeights = {
      'Hackathon': 10,
      'Technical': 8,
      'Workshop': 7,
      'Seminar': 6,
      'Non-Technical': 5
    };

    const participantScore = Math.min((event.expected_participants / 100) * 10, 10);
    const prizeScore = Math.min((event.prize_pool / 50000) * 10, 10);
    const feeScore = Math.min((event.registration_fee / 1000) * 10, 10);
    const durationScore = Math.min((event.duration_hours / 8) * 10, 10);
    const typeScore = eventTypeWeights[event.type] || 5;

    const priority = (
      0.3 * participantScore +
      0.25 * prizeScore +
      0.2 * feeScore +
      0.15 * durationScore +
      0.1 * typeScore
    );

    return parseFloat(priority.toFixed(2));
  }

  // Algorithm 1: Interval Scheduling - Check time conflicts
  hasTimeConflict(event, scheduledEvents) {
    const eventStart = new Date(`${event.date}T${event.time}`).getTime();
    const eventEnd = eventStart + (event.duration_hours * 3600000);

    return scheduledEvents.some(scheduled => {
      const schedStart = new Date(`${scheduled.date}T${scheduled.time}`).getTime();
      const schedEnd = schedStart + (scheduled.duration_hours * 3600000);
      return (eventStart < schedEnd && eventEnd > schedStart);
    });
  }

  // Algorithm 2: Graph Coloring - Match venue type to event type
  matchesEventType(venueType, eventType) {
    const mapping = {
      'Technical': ['Computer Lab', 'Classroom', 'Auditorium'],
      'Hackathon': ['Computer Lab', 'Classroom'],
      'Workshop': ['Classroom', 'Computer Lab', 'Auditorium'],
      'Seminar': ['Classroom', 'Auditorium'],
      'Non-Technical': ['Classroom', 'Auditorium']
    };
    
    return mapping[eventType] ? mapping[eventType].includes(venueType) : venueType !== 'Conference Room';
  }

  // Check if venue is occupied at event time
  isVenueOccupied(venue, event, assignments) {
    return assignments.some(assignment => {
      if (!assignment.venue || assignment.venue.toString() !== venue._id.toString()) {
        return false;
      }
      
      const assignedEvent = assignment.event;
      const eventStart = new Date(`${event.date}T${event.time}`).getTime();
      const eventEnd = eventStart + (event.duration_hours * 3600000);
      const assignedStart = new Date(`${assignedEvent.date}T${assignedEvent.time}`).getTime();
      const assignedEnd = assignedStart + (assignedEvent.duration_hours * 3600000);
      
      return (eventStart < assignedEnd && eventEnd > assignedStart);
    });
  }

  // Algorithm 3: CSP Validation
  async validateSchedule(assignments) {
    const errors = [];

    for (const assignment of assignments) {
      if (!assignment.venue) continue;

      const event = assignment.event;
      const venue = await Venue.findById(assignment.venue);

      if (event.expected_participants > venue.capacity) {
        errors.push({
          event: event.title,
          error: `Capacity exceeded: ${event.expected_participants} > ${venue.capacity}`
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Main scheduling function with Priority Queue
  async generateOptimalSchedule(eventIds) {
    console.log('[SCHEDULING] Received event IDs:', eventIds.length);
    
    const events = await Event.find({ 
      _id: { $in: eventIds }, 
      status: { $in: ['PUBLISHED', 'CHAIRPERSON_APPROVED'] },
      event_finished: { $ne: true }
    });
    
    console.log('[SCHEDULING] Found events:', events.length);
    events.forEach(e => {
      console.log(`  - ${e.title}: type=${e.type}, participants=${e.expected_participants}, date=${e.date}, time=${e.time}`);
    });
    
    const venues = await Venue.find({ isAvailable: true });
    console.log('[SCHEDULING] Available venues:', venues.length);
    venues.forEach(v => {
      console.log(`  - ${v.name}: type=${v.type}, capacity=${v.capacity}`);
    });

    const priorityQueue = new PriorityQueue();
    
    // Calculate priorities and add to queue
    for (const event of events) {
      const priority = this.calculatePriority(event);
      priorityQueue.push(event, priority);
    }

    const assignments = [];
    const scheduled = [];

    // Process events by priority (highest first)
    while (!priorityQueue.isEmpty()) {
      const { event, priority } = priorityQueue.pop();

      // Check time conflicts
      if (this.hasTimeConflict(event, scheduled)) {
        assignments.push({
          event: event,
          venue: null,
          priority,
          error: 'Time conflict with higher priority event'
        });
        continue;
      }

      // Find suitable venue (Graph Coloring)
      console.log(`[SCHEDULING] Finding venue for ${event.title} (${event.type}, ${event.expected_participants} ppl)`);
      
      const suitableVenue = venues.find(venue => {
        const capacityOk = venue.capacity >= event.expected_participants;
        const typeOk = this.matchesEventType(venue.type, event.type);
        const notOccupied = !this.isVenueOccupied(venue, event, assignments);
        
        console.log(`  Checking ${venue.name}: capacity=${capacityOk}, type=${typeOk}, available=${notOccupied}`);
        
        return capacityOk && typeOk && notOccupied;
      });

      if (suitableVenue) {
        assignments.push({
          event: event,
          venue: suitableVenue._id,
          venueName: suitableVenue.name,
          priority,
          utilization: ((event.expected_participants / suitableVenue.capacity) * 100).toFixed(2)
        });
        scheduled.push(event);
        
        // Update event with suggested venue
        event.scheduling = event.scheduling || {};
        event.scheduling.suggested_venue = suitableVenue._id;
        event.scheduling.priority_score = priority;
        await event.save();
      } else {
        assignments.push({
          event: event,
          venue: null,
          priority,
          error: 'No suitable venue available'
        });
      }
    }

    // Validate schedule (CSP)
    const validation = await this.validateSchedule(assignments);

    return {
      success: validation.valid,
      schedule: assignments.sort((a, b) => b.priority - a.priority),
      validation
    };
  }

  // Check conflicts for a specific event
  async checkConflicts(eventId) {
    const event = await Event.findById(eventId);
    const allEvents = await Event.find({ 
      status: { $in: ['PUBLISHED', 'CHAIRPERSON_APPROVED'] },
      _id: { $ne: eventId },
      event_finished: { $ne: true }
    });
    
    const conflicts = allEvents.filter(e => this.hasTimeConflict(event, [e]));

    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    };
  }

  // Suggest alternative times
  async suggestAlternativeTimes(date, duration, eventType) {
    const allEvents = await Event.find({ 
      date: date,
      status: { $in: ['PUBLISHED', 'CHAIRPERSON_APPROVED'] }
    });
    
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      const slotStart = `${hour.toString().padStart(2, '0')}:00`;
      const slotEnd = new Date(`${date}T${slotStart}`);
      slotEnd.setHours(slotEnd.getHours() + duration);
      
      const hasConflict = allEvents.some(event => {
        const eventStart = new Date(`${event.date}T${event.time}`);
        const eventEnd = new Date(eventStart);
        eventEnd.setHours(eventEnd.getHours() + event.duration_hours);
        
        const checkStart = new Date(`${date}T${slotStart}`);
        return (checkStart < eventEnd && slotEnd > eventStart);
      });
      
      if (!hasConflict) {
        slots.push({
          time: slotStart,
          reason: 'No conflicts'
        });
      }
    }
    
    return slots;
  }

  // NEW: Real-time conflict check for event creation
  async checkScheduleConflict(eventData) {
    const { date, time, duration_hours, type, expected_participants } = eventData;
    
    // Convert date string to Date object for MongoDB query
    const queryDate = new Date(date);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Get all published events on the same date
    const existingEvents = await Event.find({ 
      date: { $gte: queryDate, $lt: nextDay },
      status: { $in: ['PUBLISHED', 'CHAIRPERSON_APPROVED'] }
    });

    console.log(`[CONFLICT CHECK] Checking ${date} at ${time} for ${duration_hours}h`);
    console.log(`[CONFLICT CHECK] Found ${existingEvents.length} existing events on this date`);
    existingEvents.forEach(e => console.log(`  - ${e.title}: ${e.time} (${e.duration_hours}h)`));

    // Check for time conflicts using Interval Scheduling algorithm
    const eventStart = new Date(`${date}T${time}`).getTime();
    const eventEnd = eventStart + (duration_hours * 3600000);

    const conflicts = existingEvents.filter(existing => {
      const existStart = new Date(`${existing.date.toISOString().split('T')[0]}T${existing.time}`).getTime();
      const existEnd = existStart + (existing.duration_hours * 3600000);
      const hasConflict = (eventStart < existEnd && eventEnd > existStart);
      console.log(`  Checking ${existing.title}: ${hasConflict ? 'CONFLICT' : 'OK'}`);
      return hasConflict;
    });

    console.log(`[CONFLICT CHECK] Total conflicts: ${conflicts.length}`);

    // If conflicts exist, suggest alternative times using Priority Queue
    let suggestions = [];
    if (conflicts.length > 0) {
      // Calculate priority for new event
      const newEventPriority = this.calculatePriority({
        expected_participants,
        prize_pool: eventData.prize_pool || 0,
        registration_fee: eventData.registration_fee || 0,
        duration_hours,
        type
      });

      // Find available time slots
      const availableSlots = [];
      for (let hour = 9; hour <= 17; hour++) {
        const slotTime = `${hour.toString().padStart(2, '0')}:00`;
        const slotStart = new Date(`${date}T${slotTime}`).getTime();
        const slotEnd = slotStart + (duration_hours * 3600000);

        // Check if slot is free
        const hasConflict = existingEvents.some(event => {
          const eStart = new Date(`${event.date.toISOString().split('T')[0]}T${event.time}`).getTime();
          const eEnd = eStart + (event.duration_hours * 3600000);
          return (slotStart < eEnd && slotEnd > eStart);
        });

        if (!hasConflict && new Date(slotEnd).getHours() <= 18) {
          availableSlots.push(slotTime);
        }
      }

      // Get suitable venues using Graph Coloring algorithm
      const venues = await Venue.find({ isAvailable: true });
      const suitableVenues = venues.filter(venue =>
        venue.capacity >= expected_participants &&
        this.matchesEventType(venue.type, type)
      );

      suggestions = availableSlots.slice(0, 3).map(slotTime => ({
        time: slotTime,
        priority: newEventPriority,
        availableVenues: suitableVenues.length,
        reason: 'No conflicts, suitable venues available'
      }));
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts.map(c => ({
        title: c.title,
        time: c.time,
        duration: c.duration_hours,
        type: c.type
      })),
      suggestions,
      canProceed: true // Event Team can still proceed with their chosen time
    };
  }

  // Optimize schedule by rearranging dates and times
  async optimizeSchedule(eventIds) {
    const events = await Event.find({ 
      _id: { $in: eventIds }, 
      status: { $in: ['PUBLISHED', 'CHAIRPERSON_APPROVED'] },
      event_finished: { $ne: true }
    });
    const venues = await Venue.find({ isAvailable: true });

    // Calculate priorities
    const eventPriorities = events.map(event => ({
      event,
      priority: this.calculatePriority(event)
    })).sort((a, b) => b.priority - a.priority);

    // Find earliest and latest dates
    const dates = events.map(e => new Date(e.date));
    const startDate = new Date(Math.min(...dates));
    const endDate = new Date(Math.max(...dates));

    // Generate available time slots (9 AM - 6 PM, weekdays)
    const timeSlots = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) { // Skip weekends
        for (let hour = 9; hour <= 17; hour++) {
          timeSlots.push({
            date: new Date(d),
            time: `${hour.toString().padStart(2, '0')}:00`
          });
        }
      }
    }

    const optimizedSchedule = [];
    const usedSlots = new Map();

    // Assign events by priority
    for (const { event, priority } of eventPriorities) {
      let assigned = false;

      for (const slot of timeSlots) {
        const slotKey = `${slot.date.toISOString().split('T')[0]}_${slot.time}`;
        
        // Check if slot is available
        if (usedSlots.has(slotKey)) continue;

        // Check if event fits in this slot
        const eventEnd = new Date(`${slot.date.toISOString().split('T')[0]}T${slot.time}`);
        eventEnd.setHours(eventEnd.getHours() + event.duration_hours);
        
        if (eventEnd.getHours() > 18) continue; // Event must end by 6 PM

        // Find suitable venue
        const suitableVenue = venues.find(venue =>
          venue.capacity >= event.expected_participants &&
          this.matchesEventType(venue.type, event.type)
        );

        if (suitableVenue) {
          // Mark slots as used
          for (let h = 0; h < event.duration_hours; h++) {
            const usedSlotTime = new Date(`${slot.date.toISOString().split('T')[0]}T${slot.time}`);
            usedSlotTime.setHours(usedSlotTime.getHours() + h);
            const usedKey = `${slot.date.toISOString().split('T')[0]}_${usedSlotTime.getHours().toString().padStart(2, '0')}:00`;
            usedSlots.set(usedKey, event._id);
          }

          optimizedSchedule.push({
            event,
            originalDate: event.date,
            originalTime: event.time,
            suggestedDate: slot.date,
            suggestedTime: slot.time,
            venue: suitableVenue._id,
            venueName: suitableVenue.name,
            priority,
            changed: event.date.toISOString().split('T')[0] !== slot.date.toISOString().split('T')[0] || event.time !== slot.time
          });

          assigned = true;
          break;
        }
      }

      if (!assigned) {
        optimizedSchedule.push({
          event,
          originalDate: event.date,
          originalTime: event.time,
          error: 'Could not find suitable slot',
          priority
        });
      }
    }

    return {
      success: true,
      optimizedSchedule: optimizedSchedule.sort((a, b) => b.priority - a.priority),
      changes: optimizedSchedule.filter(s => s.changed).length,
      conflicts: optimizedSchedule.filter(s => s.error).length
    };
  }

  // Auto-allocate volunteers using Interval Scheduling for availability check
  async autoAllocateVolunteers(eventId) {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    const volunteersNeeded = event.requirements?.volunteers_needed || 0;
    if (volunteersNeeded === 0) throw new Error('No volunteers needed for this event');

    // Get all active volunteers from pool
    const allVolunteers = await Volunteer.find({ is_active: true });
    if (allVolunteers.length === 0) throw new Error('No volunteers in pool');

    // Get all published events that already have volunteers allocated
    const allocatedEvents = await Event.find({
      _id: { $ne: eventId },
      status: { $in: ['PUBLISHED', 'CHAIRPERSON_APPROVED'] },
      'hr.volunteers_allocated': true,
      event_finished: { $ne: true }
    });

    // Event time window
    const eventDate = event.date.toISOString().split('T')[0];
    const eventStart = new Date(`${eventDate}T${event.time}`).getTime();
    const eventEnd = eventStart + (event.duration_hours * 3600000);

    // Find which volunteers are busy (Interval Scheduling)
    const busyVolunteerNames = new Set();

    for (const other of allocatedEvents) {
      const otherDate = other.date.toISOString().split('T')[0];
      const otherStart = new Date(`${otherDate}T${other.time}`).getTime();
      const otherEnd = otherStart + (other.duration_hours * 3600000);

      // Check time overlap
      const hasConflict = (eventStart < otherEnd) && (eventEnd > otherStart);

      if (hasConflict && other.hr?.allocated_volunteers) {
        other.hr.allocated_volunteers.forEach(v => busyVolunteerNames.add(v.volunteer_name));
      }
    }

    // Filter available volunteers
    const available = allVolunteers.filter(v => !busyVolunteerNames.has(v.name));

    if (available.length === 0) throw new Error('No volunteers available at this time slot');

    // Pick the required number (or all available if less)
    const count = Math.min(volunteersNeeded, available.length);
    const selected = available.slice(0, count);

    return {
      allocated_volunteers: selected.map(v => ({
        volunteer_name: v.name,
        volunteer_contact: v.contact,
        volunteer_role: 'Event Volunteer',
        volunteer_department: v.department
      })),
      total_available: available.length,
      total_needed: volunteersNeeded,
      total_allocated: count,
      busy_count: busyVolunteerNames.size
    };
  }
}

module.exports = new SchedulingService();
