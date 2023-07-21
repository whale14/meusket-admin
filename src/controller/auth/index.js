const { Router } = require("express");

const ctrl = require("./ctrl");

const router = Router();

router.get("/sign_in", ctrl.signInForm);
router.post("/sign_in", ctrl.signIn);

router.get("/sign_up", ctrl.signUpForm);
router.post("/sign_up", ctrl.signUp);

router.get("/sign_out", ctrl.signOut);

router.post("/request", ctrl.adminRequest);

module.exports = router;
