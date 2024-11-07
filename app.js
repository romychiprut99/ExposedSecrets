require('dotenv').config();
const express = require("express");

const exposedSecrets = require("./routes/exposedSecrets");

const app = express();
const port = process.env.PORT || 1111;

app.use(express.json());

app.use("/exposedSecretsFetcher", exposedSecrets);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
