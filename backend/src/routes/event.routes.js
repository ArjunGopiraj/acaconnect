const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { validateStateTransition, attachValidTransitions } = require("../middleware/fsm.middleware");
const Event = require("../models/Events");
const controller = require("../controllers/event.controller");


router.get("/types/all", auth, controller.getEventTypes);
router.post("/types", auth, role("ADMIN"), controller.createEventType);
router.put("/types/:id", auth, role("ADMIN"), controller.updateEventType);


router.get("/published", controller.getPublishedEvents);
router.get("/published-with-registration", auth, controller.getPublishedEventsWithRegistration);
router.get("/my-registrations", auth, controller.getMyRegistrations);

router.param("id", async (req, res, next, id) => {
  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  req.event = event;
  next();
});

router.post("/", auth, role("EVENT_TEAM", "ADMIN"), controller.uploadMiddleware, controller.createEvent);
router.put("/:id/submit", auth, role("EVENT_TEAM", "ADMIN"), controller.submitForApproval);
router.put("/:id/treasurer-approve", auth, role("TREASURER", "ADMIN"), validateStateTransition, controller.treasurerApprove);
router.put("/:id/gen-sec-approve", auth, role("GENERAL_SECRETARY", "ADMIN"), validateStateTransition, controller.genSecApprove);
router.put("/:id/chairperson-approve", auth, role("CHAIRPERSON", "ADMIN"), validateStateTransition, controller.chairpersonApprove);
router.put("/:id/publish", auth, role("ADMIN", "CHAIRPERSON"), validateStateTransition, controller.publishEvent);
router.get("/", auth, attachValidTransitions, controller.getEvents);
router.get("/:id", auth, attachValidTransitions, controller.getEventById);
router.delete("/:id", auth, role("EVENT_TEAM", "ADMIN", "CHAIRPERSON"), controller.deleteEvent);
router.put("/:id/registration-status", auth, role("EVENT_TEAM", "ADMIN"), controller.updateRegistrationStatus);
router.put("/:id/update-price", auth, role("TREASURER", "ADMIN"), controller.updateEventPrice);
router.put("/:id/mark-finished", auth, role("EVENT_TEAM", "ADMIN"), controller.markEventFinished);
router.get("/:id/history", auth, controller.getEventHistory);
router.get("/transitions/:currentState", auth, controller.getValidTransitions);

module.exports = router;
