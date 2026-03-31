const Event = require('../models/Events');
const NotificationService = require('../services/notification.service');
const distributor = require('../services/requirementDistributor.service');
const { predicates } = require('../middleware/predicate.middleware');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'PUBLISHED' })
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 });
    
    // Apply predicate-based filtering and sorting
    const relevantEvents = await distributor.filterEventsByTeam('HR', events);
    const sortedEvents = distributor.sortByPriority(relevantEvents);
    
    res.json(sortedEvents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

exports.acknowledgeVolunteerRequirements = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.hr = {
      ...event.hr,
      requirements_acknowledged: true,
      acknowledged_at: new Date(),
      acknowledged_by: req.user.id
    };

    await event.save();

    // Try notification but don't fail if it errors
    try {
      await NotificationService.notifyRole(
        'GENERAL_SECRETARY',
        `HR team has acknowledged volunteer requirements for event "${event.title}"`
      );
    } catch (notifError) {
      console.log('Notification failed but continuing:', notifError.message);
    }

    res.json({ message: 'Volunteer requirements acknowledged successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Failed to acknowledge requirements', error: error.message });
  }
};

exports.updateVolunteerAllocation = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { allocated_volunteers, allocated_judges } = req.body;
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.hr = {
      ...event.hr,
      allocated_volunteers: allocated_volunteers || [],
      allocated_judges: allocated_judges || [],
      volunteers_allocated: true,
      volunteers_allocated_at: new Date()
    };

    await event.save();

    // Try notification but don't fail if it errors
    try {
      await NotificationService.notifyRole(
        'GENERAL_SECRETARY',
        `HR team has allocated volunteers and judges for event "${event.title}"`
      );
    } catch (notifError) {
      console.log('Notification failed but continuing:', notifError.message);
    }

    res.json({ message: 'Volunteers allocated successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Failed to allocate volunteers', error: error.message });
  }
};

exports.deleteVolunteerAllocation = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.hr = {
      ...event.hr,
      allocated_volunteers: [],
      allocated_judges: [],
      volunteers_allocated: false,
      volunteers_allocated_at: null
    };

    await event.save();

    // Try notification but don't fail if it errors
    try {
      await NotificationService.notifyRole(
        'GENERAL_SECRETARY',
        `HR team has removed volunteer allocation for event "${event.title}"`
      );
    } catch (notifError) {
      console.log('Notification failed but continuing:', notifError.message);
    }

    res.json({ message: 'Volunteer allocation deleted successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete allocation', error: error.message });
  }
};