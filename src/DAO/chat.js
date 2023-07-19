const { runQuery, runTransaction } = require("../lib/database");
const formatDate = (date) => {
    const yr = date.getFullYear();
    const mon =
        date.getMonth() + 1 > 9
            ? date.getMonth() + 1
            : "0" + (date.getMonth() + 1);
    const dt = date.getDate();
    const hrs = date.getHours();
    const mins = date.getMinutes();
    return `${mon}/${dt} ${hrs}:${mins}`;
};

const replaceDate = (object, column) => {
    return formatDate(object[column]);
};
const getChatByReqIdx = async (idx) => {
    const sql = "select * from chat_room where reqIdx = ?";
    const results = await runQuery(sql, [idx]);
    return results[0];
};

const getChatContentByIdx = async (idx) => {
    const sql = "select * from chat_content where roomIdx = ?";
    const results = await runQuery(sql, [idx]);
    for (i in results) {
        results[i].time = replaceDate(results[i], "time");
    }
    return results;
};
module.exports = { getChatByReqIdx, getChatContentByIdx };
