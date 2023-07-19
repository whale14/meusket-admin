const { Router } = require("express");
const { authRequired } = require("../auth/middleware");
const multer = require("multer");
const upload = multer();

const ctrlU = require("./ctrlUser");
const ctrlB = require("./ctrlBlack");
const ctrlH = require("./ctrlHelp");
const ctrlR = require("./ctrlReport");

const router = Router();

router.get("/user", authRequired, ctrlU.latestUser);
router.get("/users", authRequired, ctrlU.usersList);
router.get("/user/:userIdx(\\d+)", authRequired, ctrlU.showUser);
router.post("/user/block", authRequired, ctrlU.blockUser);
router.post("/user/remove", authRequired, ctrlU.removeUser);
router.post("/user/revoke", authRequired, ctrlU.revokeHelper);
router.post("/user/edit/request", authRequired, ctrlU.editUserRequest);
router.post("/user/edit", authRequired, upload.none(), ctrlU.editUser);

router.get("/apply", authRequired, ctrlH.latestApply);
router.get("/applies", authRequired, ctrlH.applyList);
router.get("/apply/:applyIdx(\\d+)", authRequired, ctrlH.showApply);
router.post("/apply/:applyIdx(\\d+)", authRequired, ctrlH.approveHelper);

router.get("/black", authRequired, ctrlB.latestBlack);
router.get("/blacks", authRequired, ctrlB.blacksList);
router.post("/black/remove_black", authRequired, ctrlB.removeBlack);

router.get("/report", authRequired, ctrlR.latestReport);
router.get("/reports", authRequired, ctrlR.reportsList);

module.exports = router;
