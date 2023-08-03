const { Router } = require("express");
const { authRequired } = require("./auth/middleware");

const ctrl = require("./ctrl");
const auth = require("./auth");
const member = require("./member");
const trade = require("./trade");
const stat = require("./stat");

const router = Router();

router.use("/auth", auth);
router.use("/member", member);
router.use("/trade", trade);
router.use("/stat", stat);

router.get("/", ctrl.indexPage);
router.get("/edit", authRequired, ctrl.editProfileForm);
router.post("/edit", authRequired, ctrl.editProfile);

router.get("/manage", authRequired, ctrl.latestAdmin);
router.get("/manages", authRequired, ctrl.manageAdminForm);
router.post("/manage", authRequired, ctrl.manageAdmin);

module.exports = router;
