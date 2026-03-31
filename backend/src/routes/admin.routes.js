const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/admin.controller");

router.get("/stats", auth, role("ADMIN"), controller.getDashboardStats);
router.get("/users", auth, role("ADMIN"), controller.getAllUsers);
router.get("/roles", auth, role("ADMIN"), controller.getAllRoles);
router.post("/users", auth, role("ADMIN"), controller.createUser);
router.get("/events", auth, role("ADMIN"), controller.getAllEvents);

module.exports = router;