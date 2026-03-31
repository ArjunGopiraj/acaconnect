const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/stationery.controller");

router.get("/", auth, controller.getAllStationery);
router.post("/", auth, role("ADMIN"), controller.createStationery);
router.put("/:id", auth, role("ADMIN"), controller.updateStationery);
router.delete("/:id", auth, role("ADMIN"), controller.deleteStationery);

module.exports = router;