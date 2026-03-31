/**
 * Predicate-Based Requirement Routes
 * 
 * These are NEW routes that add predicate-based functionality
 * WITHOUT modifying existing routes. Existing routes continue to work.
 * 
 * Frontend can optionally use these enhanced endpoints for better features.
 */

const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { predicateRoute, predicates, and } = require("../middleware/predicate.middleware");
const controller = require("../controllers/predicateRequirement.controller");

/**
 * Enhanced endpoints with predicate-based logic
 * These are OPTIONAL - existing endpoints still work
 */

// Get events with predicate-based filtering and prioritization
router.get(
  "/enhanced/events",
  auth,
  role("HR", "LOGISTICS", "HOSPITALITY"),
  controller.getEventsWithPredicates
);

// Get requirement distribution for an event
router.get(
  "/enhanced/distribution/:eventId",
  auth,
  role("HR", "LOGISTICS", "HOSPITALITY", "GENERAL_SECRETARY", "TREASURER"),
  controller.getRequirementDistribution
);

// Get pending actions for current user
router.get(
  "/enhanced/pending-actions",
  auth,
  role("HR", "LOGISTICS", "HOSPITALITY"),
  controller.getPendingActions
);

// Get dashboard statistics with predicate insights
router.get(
  "/enhanced/stats",
  auth,
  role("HR", "LOGISTICS", "HOSPITALITY"),
  controller.getDashboardStats
);

// Validate if user can perform an action
router.get(
  "/enhanced/validate/:eventId/:action",
  auth,
  role("HR", "LOGISTICS", "HOSPITALITY"),
  controller.validateAction
);

/**
 * Example of predicate-based routing middleware
 * This shows how to use predicates directly in routes
 */
router.get(
  "/enhanced/smart-route/:eventId",
  auth,
  predicateRoute([
    {
      predicate: async (context) => {
        // Route HR users to HR-specific handler
        return context.user?.role === 'HR';
      },
      handler: (req, res) => {
        res.json({ 
          message: "HR-specific route", 
          role: req.user.role 
        });
      }
    },
    {
      predicate: async (context) => {
        // Route Logistics users to Logistics-specific handler
        return context.user?.role === 'LOGISTICS';
      },
      handler: (req, res) => {
        res.json({ 
          message: "Logistics-specific route", 
          role: req.user.role 
        });
      }
    },
    {
      predicate: async (context) => {
        // Route Hospitality users to Hospitality-specific handler
        return context.user?.role === 'HOSPITALITY';
      },
      handler: (req, res) => {
        res.json({ 
          message: "Hospitality-specific route", 
          role: req.user.role 
        });
      }
    }
  ])
);

module.exports = router;
