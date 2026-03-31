const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/alumni.controller");

router.post("/", auth, role("ALUMNI", "ADMIN"), controller.addAlumni);
router.get("/", auth, role("ALUMNI", "ADMIN", "TREASURER", "GENERAL_SECRETARY", "CHAIRPERSON"), controller.getAllAlumni);
router.put("/:id", auth, role("ALUMNI", "ADMIN"), controller.updateAlumni);
router.delete("/:id", auth, role("ALUMNI", "ADMIN"), controller.deleteAlumni);

module.exports = router;
