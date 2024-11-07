const AWS = require("../../config/awsConfig");
const lambda = new AWS.Lambda();
const fetch = require("node-fetch");
const JSZip = require("jszip");

async function fetchAllLambdas() {
    const lambdas = [];
    let nextMarker = null;

    try {
        do {
            const params = {
                Marker: nextMarker,
                MaxItems: 50,
            };

            const response = await lambda.listFunctions(params).promise();
            if (response && response.Functions) {
                lambdas.push(...response.Functions);
            } else {
                console.warn("No Lambda functions found in the response.");
                break;
            }

            nextMarker = response.NextMarker;
        } while (nextMarker);

        return lambdas;

    } catch (error) {
        console.error("Error fetching Lambda functions from AWS Lambda:", error);
        throw new Error("Failed to fetch Lambda functions.");
    }
}

async function downloadLambdaCode(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch Lambda code. Status: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(buffer);
        const fileContents = [];

        await Promise.all(
            Object.values(zip.files).map(async (file) => {
                try {
                    if (!file.dir) {
                        const content = await file.async("string");
                        fileContents.push(`/* ${file.name} */\n${content}`);
                    }
                } catch (fileError) {
                    console.warn(`Failed to read file ${file.name} in the zip archive:`, fileError);
                }
            })
        );
        return fileContents.join("\n\n");

    } catch (error) {
        console.error("Error downloading or processing Lambda code:", error);
        throw new Error("Failed to download or process Lambda code.");
    }
}

module.exports = { fetchAllLambdas, downloadLambdaCode };
