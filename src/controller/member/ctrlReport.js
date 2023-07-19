const { ReportDAO } = require("../../DAO");
const moment = require("moment");

const latestReport = async (req, res, next) => {
    try {
        return res.redirect("/member/reports?status=0&page=1");
    } catch (err) {
        return next(err);
    }
};

const reportsList = async (req, res, next) => {
    try {
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    latestReport,
    reportsList,
};
