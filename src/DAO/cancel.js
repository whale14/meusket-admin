const { runQuery, runTransaction } = require("../lib/database");

const getCancelByIdx = async (idx) => {
    const sql = "select * from cancel_request where requestIdx = ?";
    const results = await runQuery(sql, [idx]);
    return results[0];
};

module.exports = { getCancelByIdx };
