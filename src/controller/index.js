const { Router } = require("express");
const { authRequired } = require("./auth/middleware");
const upload = require("../lib/upload");

const ctrl = require("./ctrl");
const auth = require("./auth");
const member = require("./member");
const trade = require("./trade");
const stat = require("./stat");
// const firebaseUpload = require("../lib/firebase-storage");

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

// router.post("/upload", upload.single("img"), async (req, res) => {
//     const img = req.file;
//     await firebaseUpload("./uploads/img.jpg");
//     return res.sendStatus(200);
// });
module.exports = router;
