/**
 * Predicate-Based Routing Middleware
 * 
 * This middleware adds intelligent routing based on complex conditions
 * without breaking existing role-based middleware.
 * 
 * Usage: Can be used alongside existing auth and role middleware
 */

class PredicateEngine {
  constructor() {
    this.rules = [];
  }

  /**
   * Add a routing rule with predicate
   * @param {Function} predicate - Function that returns boolean
   * @param {Function} handler - Handler to execute if predicate matches
   * @param {Number} priority - Higher priority rules evaluated first
   */
  addRule(predicate, handler, priority = 0) {
    this.rules.push({ predicate, handler, priority });
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Evaluate predicates and return first matching handler
   */
  async evaluate(context) {
    for (const rule of this.rules) {
      try {
        const matches = await rule.predicate(context);
        if (matches) {
          return rule.handler;
        }
      } catch (error) {
        console.error('Predicate evaluation error:', error);
      }
    }
    return null;
  }

  /**
   * Evaluate all matching predicates
   */
  async evaluateAll(context) {
    const matches = [];
    for (const rule of this.rules) {
      try {
        const matches_rule = await rule.predicate(context);
        if (matches_rule) {
          matches.push(rule);
        }
      } catch (error) {
        console.error('Predicate evaluation error:', error);
      }
    }
    return matches;
  }
}

/**
 * Predicate-based routing middleware
 * Routes requests based on complex conditions
 */
const predicateRoute = (predicates) => {
  return async (req, res, next) => {
    const context = {
      user: req.user,
      params: req.params,
      query: req.query,
      body: req.body,
      headers: req.headers,
      method: req.method,
      path: req.path
    };

    for (const rule of predicates) {
      try {
        const matches = await rule.predicate(context);
        if (matches) {
          return rule.handler(req, res, next);
        }
      } catch (error) {
        console.error('Predicate route error:', error);
        continue;
      }
    }

    // If no predicate matches, continue to next middleware
    next();
  };
};

/**
 * Common predicates for requirement distribution
 */
const predicates = {
  // Role-based predicates
  isHR: (context) => context.user?.role === 'HR',
  isLogistics: (context) => context.user?.role === 'LOGISTICS',
  isHospitality: (context) => context.user?.role === 'HOSPITALITY',
  isTreasurer: (context) => context.user?.role === 'TREASURER',
  isGeneralSecretary: (context) => context.user?.role === 'GENERAL_SECRETARY',
  
  // Event status predicates
  isPublished: (event) => event?.status === 'PUBLISHED',
  isDraft: (event) => event?.status === 'DRAFT',
  isSubmitted: (event) => event?.status === 'SUBMITTED',
  
  // Requirement predicates
  needsVolunteers: (event) => event?.requirements?.volunteers_needed > 0,
  needsVenue: (event) => event?.requirements?.rooms_needed > 0,
  needsRefreshments: (event) => event?.requirements?.refreshments_needed === true,
  needsStationery: (event) => event?.requirements?.stationary_needed === true,
  needsTechnical: (event) => event?.requirements?.technical_needed === true,
  
  // Acknowledgment predicates
  hrAcknowledged: (event) => event?.hr?.requirements_acknowledged === true,
  logisticsAcknowledged: (event) => event?.logistics?.requirements_acknowledged === true,
  hospitalityAcknowledged: (event) => event?.hospitality?.requirements_acknowledged === true,
  
  // Allocation predicates
  volunteersAllocated: (event) => event?.hr?.volunteers_allocated === true,
  venueAllocated: (event) => event?.hospitality?.venue_allocated === true,
  expenseSubmitted: (event) => event?.logistics?.expense_submitted === true,
  
  // Time-based predicates
  isUpcoming: (event) => {
    if (!event?.date) return false;
    return new Date(event.date) > new Date();
  },
  isPast: (event) => {
    if (!event?.date) return false;
    return new Date(event.date) < new Date();
  },
  isUrgent: (event) => {
    if (!event?.date) return false;
    const daysUntil = (new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntil <= 3 && daysUntil >= 0;
  },
  
  // Composite predicates
  canAcknowledgeHR: (context, event) => {
    return context.user?.role === 'HR' && 
           event?.status === 'PUBLISHED' && 
           !event?.hr?.requirements_acknowledged;
  },
  canAllocateVolunteers: (context, event) => {
    return context.user?.role === 'HR' && 
           event?.hr?.requirements_acknowledged === true && 
           !event?.hr?.volunteers_allocated;
  },
  canAcknowledgeLogistics: (context, event) => {
    return context.user?.role === 'LOGISTICS' && 
           event?.status === 'PUBLISHED' && 
           !event?.logistics?.requirements_acknowledged;
  },
  canSubmitExpense: (context, event) => {
    return context.user?.role === 'LOGISTICS' && 
           event?.logistics?.requirements_acknowledged === true && 
           new Date(event.date) < new Date(); // Event completed
  },
  canAcknowledgeHospitality: (context, event) => {
    return context.user?.role === 'HOSPITALITY' && 
           event?.status === 'PUBLISHED' && 
           !event?.hospitality?.requirements_acknowledged;
  },
  canAllocateVenue: (context, event) => {
    return context.user?.role === 'HOSPITALITY' && 
           event?.hospitality?.requirements_acknowledged === true && 
           !event?.hospitality?.venue_allocated;
  },
  
  // Priority predicates
  isHighPriority: (event) => {
    if (!event) return false;
    const daysUntil = (new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntil <= 3 || 
           event.expected_participants > 200 || 
           event.prize_pool > 50000;
  },
  
  // Completion predicates
  allRequirementsMet: (event) => {
    if (!event) return false;
    const hrDone = event.hr?.volunteers_allocated || event.requirements?.volunteers_needed === 0;
    const logisticsDone = event.logistics?.requirements_acknowledged;
    const hospitalityDone = event.hospitality?.venue_allocated || event.requirements?.rooms_needed === 0;
    return hrDone && logisticsDone && hospitalityDone;
  }
};

/**
 * Predicate combinator - AND logic
 */
const and = (...predicateFns) => {
  return async (context, event) => {
    for (const pred of predicateFns) {
      const result = await pred(context, event);
      if (!result) return false;
    }
    return true;
  };
};

/**
 * Predicate combinator - OR logic
 */
const or = (...predicateFns) => {
  return async (context, event) => {
    for (const pred of predicateFns) {
      const result = await pred(context, event);
      if (result) return true;
    }
    return false;
  };
};

/**
 * Predicate combinator - NOT logic
 */
const not = (predicateFn) => {
  return async (context, event) => {
    const result = await predicateFn(context, event);
    return !result;
  };
};

module.exports = {
  PredicateEngine,
  predicateRoute,
  predicates,
  and,
  or,
  not
};
