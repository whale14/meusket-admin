const { Router } = require("express");
const { authRequired } = require("../auth/middleware");

const router = Router();

const ctrlU = require("./ctrlUser");
const ctrlE = require("./ctrlErrand");

router.get("/user", authRequired, ctrlU.defaultStat);
router.get("/user/index", authRequired, ctrlU.userIndex);
router.get("/user/uchart", authRequired, ctrlU.userChart);
router.get("/user/hchart", authRequired, ctrlU.helperChart);

router.get("/errand", authRequired, ctrlE.defaultStat);
router.get("/errand/index", authRequired, ctrlE.errandChart);

module.exports = router;
