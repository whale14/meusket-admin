const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const pjax = require("express-pjax");
const flash = require("express-flash");
const cron = require("node-cron");
const morganMiddleware = require("./lib/logger-morgan");
const path = require("path");

const app = express();

const { errorHandler } = require("./lib/error-handler");
const router = require("./controller");

const { MODE, SESSION_SECRET } = process.env;

app.set("views", `${__dirname}/../views`);
app.set("view engine", "pug");
app.use("/", express.static(`${__dirname}/../public`));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(morgan(MODE !== "prod" ? "dev" : "combined"));
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(pjax());
app.use(flash());
app.use("/", router);

app.use(errorHandler);

const { deleteExpiredBlacklists } = require("./lib/automatic-unblock");

cron.schedule("00 00 * * *", () => {
    deleteExpiredBlacklists();
});

module.exports = app;
