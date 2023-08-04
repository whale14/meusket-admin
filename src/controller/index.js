const { Router } = require("express");
const { authRequired } = require("./auth/middleware");

const ctrl = require("./ctrl");
const auth = require("./auth");
const member = require("./member");
const trade = require("./trade");
const stat = require("./stat");
const upload = require("../lib/upload");

const router = Router();

router.use("/auth", auth);
router.use("/member", member);
router.use("/trade", trade);
router.use("/stat", stat);

router.get("/", ctrl.indexPage);
router
    .get("/edit", authRequired, ctrl.editProfileForm)
    .post("/edit", authRequired, upload.none(), ctrl.editProfile);

router
    .get("/manage", authRequired, ctrl.latestAdmin)
    .post("/manage", authRequired, ctrl.manageAdmin);
router.get("/manages", authRequired, ctrl.manageAdminForm);

module.exports = router;
