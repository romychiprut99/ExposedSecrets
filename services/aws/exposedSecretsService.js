const AWS = require("../../config/awsConfig");
const { fetchAllLambdas, downloadLambdaCode } = require("./lambdaServices");
const { getParsedSecrets } = require("./secretsManagerService");
const lambda = new AWS.Lambda();

async function findExposedSecretsInEnv() {
    try {
        const lambdas = await fetchAllLambdas();
        const secretsWithValues = await getParsedSecrets();
        const exposedSecrets = [];

        for (const lambdaFunction of lambdas) {
            const envVars = lambdaFunction.Environment?.Variables || {};

            for (const {arn, values} of secretsWithValues) {
                for (const [key, value] of Object.entries(values)) {
                    if (envVars[key] === value) {
                        exposedSecrets.push({
                            secretArn: arn,
                            lambdaName: lambdaFunction.FunctionName,
                        });
                    }
                }
            }
        }
        return exposedSecrets;

    } catch (error) {
        console.error("Error finding exposed secrets in lambda environment variables:", error);
        throw new Error("Failed to find exposed secrets in lambda environment variables.");
    }
}

async function findExposedSecretsInCode() {
    try {
        const lambdas = await fetchAllLambdas();
        const secretsWithValues = await getParsedSecrets();
        const exposedSecrets = [];

        for (const lambdaFunction of lambdas) {
            const functionResponse = await lambda
                .getFunction({FunctionName: lambdaFunction.FunctionName})
                .promise();

            const codeUrl = functionResponse.Code?.Location;
            if (!codeUrl) {
                console.warn(`No code location found for Lambda function: ${lambdaFunction.FunctionName}`);
                continue;
            }

            const code = await downloadLambdaCode(codeUrl);

            for (const {arn, values} of secretsWithValues) {
                for (const [key, value] of Object.entries(values)) {
                    if (code.includes(value)) {
                        exposedSecrets.push({
                            secretArn: arn,
                            lambdaName: lambdaFunction.FunctionName,
                        });
                    }
                }
            }
        }
        return exposedSecrets;

    } catch (error) {
        console.error("Error finding exposed secrets in lambda function code:", error);
        throw new Error("Failed to find exposed secrets in lambda function.");
    }
}

module.exports = { findExposedSecretsInEnv, findExposedSecretsInCode };
