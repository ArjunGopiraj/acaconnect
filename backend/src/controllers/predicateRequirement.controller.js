/**
 * Enhanced Requirement Controllers with Predicate-Based Logic
 * 
 * These controllers add intelligent requirement distribution
 * while maintaining full backward compatibility with existing system.
 */

const Event = require('../models/Events');
const distributor = require('../services/requirementDistributor.service');
const { predicates } = require('../middleware/predicate.middleware');

/**
 * Get events with predicate-based filtering and prioritization
 * This enhances the existing getEvents functionality
 */
exports.getEventsWithPredicates = async (req, res) => {
  try {
    const userRole = req.user.role;
    const events = await Event.find({ status: 'PUBLISHED' })
      .populate('created_by', 'name email')
      .sort({ date: 1 });

    // Filter events relevant to user's team
    const relevantEvents = await distributor.filterEventsByTeam(userRole, events);

    // Sort by priority
    const prioritizedEvents = distributor.sortByPriority(relevantEvents);

    // Add pending actions for each event
    const eventsWithActions = await Promise.all(
      prioritizedEvents.map(async (event) => {
        const eventObj = event.toObject();
        eventObj.pendingActions = await distributor.getPendingActions(userRole, event, req.user);
        eventObj.completionStatus = distributor.getCompletionStatus(event);
        eventObj.isHighPriority = predicates.isHighPriority(event);
        eventObj.isUrgent = predicates.isUrgent(event);
        return eventObj;
      })
    );

    res.json(eventsWithActions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch events', 
      error: error.message 
    });
  }
};

/**
 * Get requirement distribution for an event
 */
exports.getRequirementDistribution = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const distribution = await distributor.distribute(event);
    const completionStatus = distributor.getCompletionStatus(event);

    res.json({
      event_id: event._id,
      event_title: event.title,
      distribution,
      completionStatus,
      isHighPriority: predicates.isHighPriority(event),
      isUrgent: predicates.isUrgent(event)
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get distribution', 
      error: error.message 
    });
  }
};

/**
 * Get pending actions for current user
 */
exports.getPendingActions = async (req, res) => {
  try {
    const userRole = req.user.role;
    const events = await Event.find({ status: 'PUBLISHED' });

    const allActions = [];

    for (const event of events) {
      const actions = await distributor.getPendingActions(userRole, event, req.user);
      if (actions.length > 0) {
        allActions.push({
          event_id: event._id,
          event_title: event.title,
          event_date: event.date,
          actions
        });
      }
    }

    // Sort by urgency
    allActions.sort((a, b) => {
      const aUrgent = a.actions.some(action => action.priority === 'URGENT');
      const bUrgent = b.actions.some(action => action.priority === 'URGENT');
      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;
      return new Date(a.event_date) - new Date(b.event_date);
    });

    res.json(allActions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get pending actions', 
      error: error.message 
    });
  }
};

/**
 * Get dashboard statistics with predicate-based insights
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const events = await Event.find({ status: 'PUBLISHED' });

    const stats = {
      total: events.length,
      pending: 0,
      completed: 0,
      urgent: 0,
      highPriority: 0
    };

    for (const event of events) {
      const actions = await distributor.getPendingActions(userRole, event, req.user);
      
      if (actions.length > 0) {
        stats.pending++;
      } else {
        stats.completed++;
      }

      if (predicates.isUrgent(event)) {
        stats.urgent++;
      }

      if (predicates.isHighPriority(event)) {
        stats.highPriority++;
      }
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get stats', 
      error: error.message 
    });
  }
};

/**
 * Validate action permission using predicates
 */
exports.validateAction = async (req, res) => {
  try {
    const { eventId, action } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const context = { user: req.user };
    let canPerform = false;

    switch (action) {
      case 'acknowledge_hr':
        canPerform = predicates.canAcknowledgeHR(context, event);
        break;
      case 'allocate_volunteers':
        canPerform = predicates.canAllocateVolunteers(context, event);
        break;
      case 'acknowledge_logistics':
        canPerform = predicates.canAcknowledgeLogistics(context, event);
        break;
      case 'submit_expense':
        canPerform = predicates.canSubmitExpense(context, event);
        break;
      case 'acknowledge_hospitality':
        canPerform = predicates.canAcknowledgeHospitality(context, event);
        break;
      case 'allocate_venue':
        canPerform = predicates.canAllocateVenue(context, event);
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({ 
      canPerform,
      event_id: eventId,
      action,
      user_role: req.user.role
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to validate action', 
      error: error.message 
    });
  }
};
