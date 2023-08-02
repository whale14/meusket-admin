const { Router } = require("express");
const upload = require("../../lib/upload");
const { authRequired } = require("../auth/middleware");

const ctrlE = require("./ctrlErrand");
const ctrlR = require("./ctrlReport");

const router = Router();

router.get("/errand", authRequired, ctrlE.latestErrand);
router.get("/errands", authRequired, ctrlE.errandsList);
router.get("/errand/:errandIdx(\\d+)", authRequired, ctrlE.showErrand);
router.post("/errand/edit", authRequired, upload.none(), ctrlE.editRequest);

router.get("/report", authRequired, ctrlR.latestReport);
router.get("/reports", authRequired, ctrlR.reportsList);
router.get("/report/:reportIdx(\\d+)", authRequired, ctrlR.showReport);
router.post("/report/action", authRequired, ctrlR.getActionReport);
router.post("/report/update", authRequired, ctrlR.updateReport);

module.exports = router;
