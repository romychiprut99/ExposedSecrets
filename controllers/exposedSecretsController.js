const { findExposedSecretsInEnv, findExposedSecretsInCode } = require("../services/aws/exposedSecretsService");

async function getExposedSecretsInEnv(req, res) {
    try {
        const exposedSecrets = await findExposedSecretsInEnv();
        res.json(exposedSecrets);
    } catch (error) {
        console.error("Error in getExposedSecretsInEnv:", error);
        res.status(500).json({ error: "Failed to fetch exposed secrets in environment variables." });
    }
}

async function getExposedSecretsInCode(req, res) {
    try {
        const exposedSecrets = await findExposedSecretsInCode();
        res.json(exposedSecrets);
    } catch (error) {
        console.error("Error in getExposedSecretsInCode:", error);
        res.status(500).json({ error: "Failed to fetch exposed secrets in code." });
    }
}

module.exports = { getExposedSecretsInEnv, getExposedSecretsInCode };
