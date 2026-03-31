const Event = require("../models/Events");
const User = require("../models/User");
const NotificationService = require("../services/notification.service");
const { logAPICall } = require("../utils/logger");
const distributor = require('../services/requirementDistributor.service');
const { predicates } = require('../middleware/predicate.middleware');

console.log('=== HOSPITALITY CONTROLLER LOADED ===');

exports.getEvents = async (req, res) => {
  try {
    console.log('=== HOSPITALITY GET EVENTS CALLED ===');
    console.log('User:', req.user);
    console.log('User Role:', req.user?.role);
    
    const events = await Event.find({ status: 'PUBLISHED' })
      .populate('created_by', 'name email')
      .populate('scheduling.suggested_venue', 'name type capacity')
      .sort({ date: 1 });
    
    console.log('Found events count:', events.length);

    // Apply predicate-based filtering and sorting
    const relevantEvents = await distributor.filterEventsByTeam('HOSPITALITY', events);
    const sortedEvents = distributor.sortByPriority(relevantEvents);

    res.json(sortedEvents);
  } catch (error) {
    res.status(500).json({ message: "Failed to get events", error: error.message });
  }
};

exports.acknowledgeVenueRequirements = async (req, res) => {
  try {
    logAPICall('/hospitality/acknowledge/:eventId', 'POST', { eventId: req.params.eventId });
    console.log('=== ACKNOWLEDGE VENUE REQUIREMENTS CALLED ===');
    const { eventId } = req.params;
    const userId = req.user.id;

    console.log('Event ID:', eventId);
    console.log('User ID:', userId);

    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        'hospitality.requirements_acknowledged': true,
        'hospitality.acknowledged_at': new Date(),
        'hospitality.acknowledged_by': userId
      },
      { new: true }
    );

    if (!event) {
      console.log('Event not found for ID:', eventId);
      return res.status(404).json({ message: "Event not found" });
    }

    console.log('Venue requirements acknowledged, sending notification...');

    // Send notification to general secretary about acknowledgment
    await NotificationService.notifyRole(
      'GENERAL_SECRETARY',
      `Hospitality has acknowledged venue requirements for event "${event.title}"`
    );
    
    console.log('Notification sent to treasurer');
    
    res.json({ message: "Venue requirements acknowledged successfully", event });
  } catch (error) {
    console.error('Error in acknowledgeVenueRequirements:', error);
    res.status(500).json({ message: "Failed to acknowledge venue requirements", error: error.message });
  }
};

exports.updateVenueAllocation = async (req, res) => {
  try {
    logAPICall('/hospitality/venue/:eventId', 'POST', { eventId: req.params.eventId });
    console.log('=== VENUE ALLOCATION UPDATE CALLED ===');
    const { eventId } = req.params;
    const { allocated_rooms, lab_allocated, venue_details } = req.body;

    console.log('Event ID:', eventId);
    console.log('Allocated rooms:', allocated_rooms);
    console.log('Lab allocated:', lab_allocated);
    console.log('Venue details:', venue_details);

    const event = await Event.findById(eventId);
    if (!event) {
      console.log('Event not found for ID:', eventId);
      return res.status(404).json({ message: "Event not found" });
    }

    // Update hospitality fields
    event.hospitality = event.hospitality || {};
    event.hospitality.allocated_rooms = allocated_rooms;
    event.hospitality.lab_allocated = lab_allocated;
    event.hospitality.venue_details = venue_details;
    event.hospitality.venue_allocated = true;
    event.hospitality.venue_allocated_at = new Date();
    event.venue = venue_details;

    // If there's a suggested venue, mark it as accepted
    if (event.scheduling?.suggested_venue) {
      event.scheduling.assigned_venue = event.scheduling.suggested_venue;
      event.scheduling.hospitality_approved = true;
      event.scheduling.assigned_by = req.user.id;
      event.scheduling.assigned_at = new Date();
    }

    await event.save();

    console.log('Venue allocated successfully, sending notification...');
    
    // Send notification to general secretary about venue allocation
    await NotificationService.notifyRole(
      'GENERAL_SECRETARY',
      `Hospitality has allocated venue for event "${event.title}" - ${venue_details}`
    );
    
    console.log('Notification sent to treasurer');
    
    res.json({ message: "Venue allocated successfully", event });
  } catch (error) {
    console.error('Error in updateVenueAllocation:', error);
    res.status(500).json({ message: "Failed to allocate venue", error: error.message });
  }
};

exports.deleteVenueAllocation = async (req, res) => {
  try {
    logAPICall('/hospitality/venue/:eventId', 'DELETE', { eventId: req.params.eventId });
    console.log('=== DELETE VENUE ALLOCATION CALLED ===');
    const { eventId } = req.params;

    console.log('Event ID:', eventId);

    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        $unset: {
          'hospitality.allocated_rooms': 1,
          'hospitality.lab_allocated': 1,
          'hospitality.venue_details': 1,
          'hospitality.venue_allocated': 1,
          'hospitality.venue_allocated_at': 1
        }
      },
      { new: true }
    );

    if (!event) {
      console.log('Event not found for ID:', eventId);
      return res.status(404).json({ message: "Event not found" });
    }

    console.log('Venue allocation deleted successfully, sending notification...');
    
    // Send notification to general secretary about venue allocation deletion
    await NotificationService.notifyRole(
      'GENERAL_SECRETARY',
      `Hospitality has removed the venue allocation for event "${event.title}"`
    );
    
    console.log('Notification sent to treasurer');
    
    res.json({ message: "Venue allocation deleted successfully", event });
  } catch (error) {
    console.error('Error in deleteVenueAllocation:', error);
    res.status(500).json({ message: "Failed to delete venue allocation", error: error.message });
  }
};