const { runQuery, runTransaction } = require("../lib/database");
const moment = require("moment");

const formatDate = (date) => {
    const yr = date.getFullYear();
    const mon =
        date.getMonth() + 1 > 9
            ? date.getMonth() + 1
            : "0" + (date.getMonth() + 1);
    const dt = date.getDate();
    const hrs = date.getHours();
    const mins = date.getMinutes();
    return `${yr}-${mon}-${dt} ${hrs}:${mins}`;
};

const replaceDate = (object, column) => {
    return formatDate(object[column]);
};

const getWalletByUserIdx = async (idx, month) => {
    const sql =
        "select * from wallet where userIdx = ? AND DATE_FORMAT(settleAt, '%Y-%m') = ? order by settleAt desc";
    const results = await runQuery(sql, [idx, month]);
    for (i in results) {
        results[i].settleAt = replaceDate(results[i], "settleAt");
    }
    return results;
};

const getWalletHasNextPrevPage = async (idx, month) => {
    const prevSql =
        "SELECT COUNT(*) FROM wallet WHERE userIdx = ? AND DATE_FORMAT(settleAt, '%Y-%m') < ?";
    const nextSql =
        "SELECT COUNT(*) FROM wallet WHERE userIdx = ? AND DATE_FORMAT(settleAt, '%Y-%m') > ?";
    const prevResults = await runQuery(prevSql, [idx, month]);
    const nextResults = await runQuery(nextSql, [idx, month]);
    return {
        hasPrev: prevResults[0]["COUNT(*)"] > 0,
        hasNext: nextResults[0]["COUNT(*)"] > 0,
    };
};

const getSumOfMoneyByUserIdx = async (idx) => {
    const sql = "select sum(money) from wallet where userIdx = ?";
    const results = await runQuery(sql, [idx]);
    return results[0]["sum(money)"];
};

module.exports = {
    getWalletByUserIdx,
    getWalletHasNextPrevPage,
    getSumOfMoneyByUserIdx,
};
