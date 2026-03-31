const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/hospitality.controller");

router.get("/events", auth, role("HOSPITALITY"), controller.getEvents);
router.post("/acknowledge/:eventId", auth, role("HOSPITALITY"), controller.acknowledgeVenueRequirements);
router.post("/venue/:eventId", auth, role("HOSPITALITY"), controller.updateVenueAllocation);
router.delete("/venue/:eventId", auth, role("HOSPITALITY"), controller.deleteVenueAllocation);

module.exports = router;