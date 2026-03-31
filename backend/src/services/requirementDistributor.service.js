const { predicates, and, or } = require('../middleware/predicate.middleware');

class RequirementDistributor {
  constructor() {
    this.distributionRules = [];
    this.initializeRules();
  }

  initializeRules() {
   
    this.addRule({
      team: 'HR',
      predicate: (event) => predicates.needsVolunteers(event),
      priority: (event) => predicates.isHighPriority(event) ? 10 : 5,
      requirements: (event) => ({
        volunteers_needed: event.requirements.volunteers_needed,
        judges_needed: event.requirements.judges_needed,
        expected_participants: event.expected_participants,
        duration_hours: event.duration_hours
      })
    });

   
    this.addRule({
      team: 'LOGISTICS',
      predicate: (event) => 
        predicates.needsRefreshments(event) || 
        predicates.needsStationery(event) || 
        predicates.needsTechnical(event),
      priority: (event) => predicates.isHighPriority(event) ? 10 : 5,
      requirements: (event) => ({
        refreshments_needed: event.requirements.refreshments_needed,
        refreshment_items: event.requirements.refreshment_items,
        stationary_needed: event.requirements.stationary_needed,
        stationary_items: event.requirements.stationary_items,
        technical_needed: event.requirements.technical_needed,
        technical_items: event.requirements.technical_items,
        goodies_needed: event.requirements.goodies_needed,
        physical_certificate: event.requirements.physical_certificate,
        trophies_needed: event.requirements.trophies_needed
      })
    });

   
    this.addRule({
      team: 'HOSPITALITY',
      predicate: (event) => predicates.needsVenue(event),
      priority: (event) => predicates.isHighPriority(event) ? 10 : 5,
      requirements: (event) => ({
        rooms_needed: event.requirements.rooms_needed,
        expected_participants: event.expected_participants,
        duration_hours: event.duration_hours,
        event_type: event.type
      })
    });
  }

  
  addRule(rule) {
    this.distributionRules.push(rule);
  }

  
  async distribute(event) {
    const distribution = {
      HR: null,
      LOGISTICS: null,
      HOSPITALITY: null
    };

    for (const rule of this.distributionRules) {
      try {
        const matches = await rule.predicate(event);
        if (matches) {
          distribution[rule.team] = {
            priority: typeof rule.priority === 'function' ? rule.priority(event) : rule.priority,
            requirements: rule.requirements(event),
            event_id: event._id,
            event_title: event.title,
            event_date: event.date
          };
        }
      } catch (error) {
        console.error(`Distribution rule error for ${rule.team}:`, error);
      }
    }

    return distribution;
  }


  async getPendingActions(team, event, user) {
    const actions = [];

    if (team === 'HR') {
      if (!predicates.hrAcknowledged(event)) {
        actions.push({
          action: 'ACKNOWLEDGE_REQUIREMENTS',
          priority: predicates.isUrgent(event) ? 'URGENT' : 'NORMAL',
          canPerform: predicates.canAcknowledgeHR({ user }, event)
        });
      } else if (!predicates.volunteersAllocated(event)) {
        actions.push({
          action: 'ALLOCATE_VOLUNTEERS',
          priority: predicates.isUrgent(event) ? 'URGENT' : 'NORMAL',
          canPerform: predicates.canAllocateVolunteers({ user }, event)
        });
      }
    }

    if (team === 'LOGISTICS') {
      if (!predicates.logisticsAcknowledged(event)) {
        actions.push({
          action: 'ACKNOWLEDGE_REQUIREMENTS',
          priority: predicates.isUrgent(event) ? 'URGENT' : 'NORMAL',
          canPerform: predicates.canAcknowledgeLogistics({ user }, event)
        });
      } else if (predicates.isPast(event) && !predicates.expenseSubmitted(event)) {
        actions.push({
          action: 'SUBMIT_EXPENSE',
          priority: 'HIGH',
          canPerform: predicates.canSubmitExpense({ user }, event)
        });
      }
    }

    if (team === 'HOSPITALITY') {
      if (!predicates.hospitalityAcknowledged(event)) {
        actions.push({
          action: 'ACKNOWLEDGE_REQUIREMENTS',
          priority: predicates.isUrgent(event) ? 'URGENT' : 'NORMAL',
          canPerform: predicates.canAcknowledgeHospitality({ user }, event)
        });
      } else if (!predicates.venueAllocated(event)) {
        actions.push({
          action: 'ALLOCATE_VENUE',
          priority: predicates.isUrgent(event) ? 'URGENT' : 'NORMAL',
          canPerform: predicates.canAllocateVenue({ user }, event)
        });
      }
    }

    return actions;
  }

  
  async filterEventsByTeam(team, events) {
    const relevantEvents = [];

    for (const event of events) {
      let isRelevant = false;

      if (team === 'HR' && predicates.needsVolunteers(event)) {
        isRelevant = true;
      } else if (team === 'LOGISTICS' && (
        predicates.needsRefreshments(event) || 
        predicates.needsStationery(event) || 
        predicates.needsTechnical(event)
      )) {
        isRelevant = true;
      } else if (team === 'HOSPITALITY' && predicates.needsVenue(event)) {
        isRelevant = true;
      }

      if (isRelevant) {
        relevantEvents.push(event);
      }
    }

    return relevantEvents;
  }

 
  sortByPriority(events) {
    return events.sort((a, b) => {
      const aPriority = predicates.isHighPriority(a) ? 1 : 0;
      const bPriority = predicates.isHighPriority(b) ? 1 : 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // High priority first
      }
      
      
      return new Date(a.date) - new Date(b.date);
    });
  }

  
  getCompletionStatus(event) {
    return {
      hr: {
        acknowledged: predicates.hrAcknowledged(event),
        allocated: predicates.volunteersAllocated(event),
        complete: predicates.volunteersAllocated(event) || event.requirements?.volunteers_needed === 0
      },
      logistics: {
        acknowledged: predicates.logisticsAcknowledged(event),
        expenseSubmitted: predicates.expenseSubmitted(event),
        complete: predicates.logisticsAcknowledged(event)
      },
      hospitality: {
        acknowledged: predicates.hospitalityAcknowledged(event),
        allocated: predicates.venueAllocated(event),
        complete: predicates.venueAllocated(event) || event.requirements?.rooms_needed === 0
      },
      overall: predicates.allRequirementsMet(event)
    };
  }
}

const distributor = new RequirementDistributor();

module.exports = distributor;
