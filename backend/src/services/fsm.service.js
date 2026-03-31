const EventStateMachine = {
  states: {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    TREASURER_APPROVED: 'Approved by Treasurer',
    GENSEC_APPROVED: 'Approved by Gen Sec',
    CHAIRPERSON_APPROVED: 'Approved by Chairperson',
    PUBLISHED: 'Published',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled'
  },

  transitions: {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['UNDER_REVIEW', 'REJECTED'],
    UNDER_REVIEW: ['TREASURER_APPROVED', 'REJECTED'],
    TREASURER_APPROVED: ['GENSEC_APPROVED', 'REJECTED'],
    GENSEC_APPROVED: ['CHAIRPERSON_APPROVED', 'REJECTED'],
    CHAIRPERSON_APPROVED: ['PUBLISHED', 'REJECTED'],
    PUBLISHED: ['CANCELLED'],
    REJECTED: ['SUBMITTED'],
    CANCELLED: []
  },

  rolePermissions: {
    'DRAFT → SUBMITTED': ['EVENT_TEAM'],
    'SUBMITTED → UNDER_REVIEW': ['EVENT_TEAM', 'ADMIN'],
    'UNDER_REVIEW → TREASURER_APPROVED': ['TREASURER', 'ADMIN'],
    'UNDER_REVIEW → REJECTED': ['TREASURER', 'ADMIN'],
    'TREASURER_APPROVED → GENSEC_APPROVED': ['GENERAL_SECRETARY', 'ADMIN'],
    'TREASURER_APPROVED → REJECTED': ['GENERAL_SECRETARY', 'ADMIN'],
    'GENSEC_APPROVED → CHAIRPERSON_APPROVED': ['CHAIRPERSON', 'ADMIN'],
    'GENSEC_APPROVED → REJECTED': ['CHAIRPERSON', 'ADMIN'],
    'CHAIRPERSON_APPROVED → PUBLISHED': ['CHAIRPERSON', 'ADMIN'],
    'PUBLISHED → CANCELLED': ['ADMIN', 'CHAIRPERSON'],
    'REJECTED → SUBMITTED': ['EVENT_TEAM']
  }
};

class FSMService {
  static canTransition(currentState, targetState, userRole) {
    const validTransitions = EventStateMachine.transitions[currentState] || [];
    if (!validTransitions.includes(targetState)) return false;

    const transitionKey = `${currentState} → ${targetState}`;
    const allowedRoles = EventStateMachine.rolePermissions[transitionKey] || [];
    return allowedRoles.includes(userRole);
  }

  static getValidTransitions(currentState, userRole) {
    const possibleTransitions = EventStateMachine.transitions[currentState] || [];
    return possibleTransitions.filter(targetState => {
      const transitionKey = `${currentState} → ${targetState}`;
      const allowedRoles = EventStateMachine.rolePermissions[transitionKey] || [];
      return allowedRoles.includes(userRole);
    });
  }

  static getStateLabel(state) {
    return EventStateMachine.states[state] || state;
  }

  static async transitionEvent(eventId, targetState, userRole, comment = '') {
    const Event = require('../models/Events');
    const event = await Event.findById(eventId);
    
    if (!event) throw new Error('Event not found');
    
    if (!this.canTransition(event.status, targetState, userRole)) {
      throw new Error(`Invalid transition from ${event.status} to ${targetState} for role ${userRole}`);
    }

    const previousState = event.status;
    event.status = targetState;
    event.statusHistory = event.statusHistory || [];
    event.statusHistory.push({
      from: previousState,
      to: targetState,
      changedBy: userRole,
      comment,
      timestamp: new Date()
    });

    await event.save();
    await this.triggerEventHandlers(event, previousState, targetState);
    return event;
  }

  static async triggerEventHandlers(event, fromState, toState) {
    const NotificationService = require('./notification.service');
    
    
    if (fromState !== toState) {
      await NotificationService.notifyEventCreator(
        event.created_by, 
        `Your event "${event.title}" status changed: ${this.getStateLabel(fromState)} → ${this.getStateLabel(toState)}`
      );
    }
    
    
    const notificationHandlers = {
      'SUBMITTED → UNDER_REVIEW': () => NotificationService.notifyRole(
        'TREASURER', 
        `New event "${event.title}" submitted for budget review`
      ),
      'TREASURER_APPROVED': () => NotificationService.notifyRole(
        'GENERAL_SECRETARY', 
        `Event "${event.title}" approved by Treasurer - awaiting your review`
      ),
      'GENSEC_APPROVED': () => NotificationService.notifyRole(
        'CHAIRPERSON', 
        `Event "${event.title}" approved by General Secretary - awaiting final approval`
      ),
      'CHAIRPERSON_APPROVED → PUBLISHED': () => {
        NotificationService.notifyRole('EVENT_TEAM', `Event "${event.title}" has been published!`);
        NotificationService.notifyRole('STUDENT', `New event available: "${event.title}"`);
      },
      'REJECTED': () => NotificationService.notifyEventCreator(
        event.created_by,
        `Your event "${event.title}" has been rejected. Please review and resubmit.`
      )
    };

    
    const handlerKey = `${fromState} → ${toState}`;
    if (notificationHandlers[handlerKey]) {
      await notificationHandlers[handlerKey]();
    }
    
  
    if (notificationHandlers[toState]) {
      await notificationHandlers[toState]();
    }
  }
}

module.exports = { FSMService, EventStateMachine };