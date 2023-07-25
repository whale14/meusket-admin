require("./env");
const app = require("./app");
const https = require("https");

const HTTP_PORT = process.env.PORT || 3001;
const HTTPS_PORT = process.env.PORT || 4001;

app.listen(HTTP_PORT, () => {
    console.log(`Admin Page is Listening on port ${HTTP_PORT}.`);
});
