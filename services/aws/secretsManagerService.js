const AWS = require("../../config/awsConfig");
const secretsManager = new AWS.SecretsManager();

async function fetchAllSecrets() {
    const secrets = [];
    let nextToken = null;

    try {
        do {
            const params = {
                NextToken: nextToken,
                MaxResults: 100,
            };
            const response = await secretsManager.listSecrets(params).promise();
            if (response && response.SecretList) {
                secrets.push(...response.SecretList);
            } else {
                console.warn("No secrets found in the response.");
                break;
            }
            nextToken = response.NextToken;
        } while (nextToken);

        return secrets;
    } catch (error) {
        console.error("Error fetching secrets from AWS Secrets Manager:", error);
        throw new Error("Failed to fetch secrets.");
    }
}

async function getParsedSecrets() {
    try {
        const secrets = await fetchAllSecrets();
        const secretsWithValues = await Promise.all(
            secrets.map(async (secret) => {
                try {
                    const secretValue = await secretsManager.getSecretValue({ SecretId: secret.ARN }).promise();
                    let parsedSecretValue;

                    try {
                        parsedSecretValue = JSON.parse(secretValue.SecretString);
                    } catch (parseError) {
                        console.warn(`Secret ${secret.ARN} is not in JSON format. Using raw value.`);
                        parsedSecretValue = { raw: secretValue.SecretString };
                    }

                    return { arn: secret.ARN, values: parsedSecretValue };

                } catch (secretFetchError) {
                    console.error(`Failed to retrieve secret value for ${secret.ARN}:`, secretFetchError);
                    return { arn: secret.ARN, values: null, error: "Failed to retrieve secret value" };
                }
            })
        );
        return secretsWithValues;

    } catch (error) {
        console.error("Error fetching and parsing secrets:", error);
        throw new Error("Failed to fetch and parse secrets.");
    }
}

module.exports = { getParsedSecrets };
