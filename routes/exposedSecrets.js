const express = require("express");
const { getExposedSecretsInEnv, getExposedSecretsInCode } = require("../controllers/exposedSecretsController");

const router = express.Router();

router.get("/getExposedSecretsInEnv", getExposedSecretsInEnv);
router.get("/getExposedSecretsInCode", getExposedSecretsInCode);

module.exports = router;
