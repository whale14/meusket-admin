const { Router } = require("express");
const { authRequired } = require("../auth/middleware");
const upload = require("../../lib/upload");

const ctrlU = require("./ctrlUser");
const ctrlB = require("./ctrlBlack");
const ctrlH = require("./ctrlHelp");
const ctrlR = require("./ctrlReport");
const ctrlP = require("./ctrlPush");

const router = Router();

router.get("/user", authRequired, ctrlU.latestUser);
router.get("/users", authRequired, ctrlU.usersList);
router.get("/user/:userIdx(\\d+)", authRequired, ctrlU.showUser);
router.post("/user/block", authRequired, ctrlU.blockUser);
router.post("/user/remove", authRequired, ctrlU.removeUser);
router.post("/user/revoke", authRequired, ctrlU.revokeHelper);
router.post("/user/edit", authRequired, upload.none(), ctrlU.editUser);
router.get("/user/wallet/:userIdx(\\d+)", authRequired, ctrlU.showWallet);
router.get("/user/request/:userIdx(\\d+)", authRequired, ctrlU.showRequest);

router.get("/apply", authRequired, ctrlH.latestApply);
router.get("/applies", authRequired, ctrlH.applyList);
router
    .get("/apply/:applyIdx(\\d+)", authRequired, ctrlH.showApply)
    .post("/apply/:applyIdx(\\d+)", authRequired, ctrlH.approveHelper);

router.get("/black", authRequired, ctrlB.latestBlack);
router.get("/blacks", authRequired, ctrlB.blacksList);
router.post("/black/unblock", authRequired, upload.none(), ctrlB.removeBlack);

router.get("/report", authRequired, ctrlR.latestReport);
router.get("/reports", authRequired, ctrlR.reportsList);
router.get("/report/:reportIdx(\\d+)", authRequired, ctrlR.showReport);
router.post("/report/action", authRequired, ctrlR.getActionReport);

router.get("/pushes", authRequired, ctrlP.sendPushNotificationForm);
router
    .get("/push", authRequired, ctrlP.lastestPushes)
    .post(
        "/push",
        upload.single("pushImage"),
        authRequired,
        ctrlP.sendPushNotification
    );
router.get("/push/:pushIdx(\\d+)", authRequired, ctrlP.showPush);

module.exports = router;
