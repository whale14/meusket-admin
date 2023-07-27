const { runQuery, runTransaction } = require("../lib/database");

const formatDate = (date, type) => {
    if (typeof date === "string") date = new Date(date);
    const yr = date.getFullYear();
    const mon = date.getMonth() + 1;
    const dt = date.getDate();
    const hrs = date.getHours();
    const mins = date.getMinutes();
    const secs = date.getSeconds();
    if (type == "ymd") return `${yr}. ${mon}. ${dt}`;
    return `${yr}. ${mon}. ${dt} ${hrs}:${mins}:${secs}`;
};

const replaceDate = (object, type) => {
    if (object) {
        if (object.sendAt) object.regDate = formatDate(object.regDate, type);
    }
    return object;
};

const getPushes = async (start, count) => {
    const sql =
        "SELECT app_push.*, admin.name as admin_name, admin.id as admin_id, (ROW_NUMBER() OVER (ORDER BY app_push.idx ASC)) AS pidx FROM app_push \
        INNER JOIN admin ON admin.idx = app_push.adminIdx ORDER BY app_push.idx ASC LIMIT ?, ?";
    const results = await runQuery(sql, [start, count]);
    for (i in results) {
        results[i].sendAt = replaceDate(results[i], "ymd");
    }
    return results;
};

const getPushesCount = async () => {
    const sql = "select count(*) from app_push";
    const results = await runQuery(sql);
    return results[0]["count(*)"];
};

module.exports = { getPushes, getPushesCount };
