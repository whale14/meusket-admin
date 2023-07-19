require("./env");
const app = require("./app");

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Admin Page is Listening on port ${port}.`);
});
