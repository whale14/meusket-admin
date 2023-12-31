const { runQuery, runTransaction } = require("../lib/database");

const formatDate = (date) => {
    if (typeof date === "string") date = new Date(date);
    const yr = date.getFullYear();
    const mon = date.getMonth() + 1;
    const dt = date.getDate();
    const hrs = date.getHours();
    const mins = date.getMinutes();
    return `${yr}. ${mon}. ${dt} ${hrs}:${mins}`;
};

const replaceDate = (object) => {
    if (object) {
        if (object.sendAt) object.sendAt = formatDate(object.sendAt);
    }
    return object;
};

const getPushes = async (start, count) => {
    const sql =
        "SELECT app_push.*, admin.name as admin_name, admin.id as admin_id, (ROW_NUMBER() OVER (ORDER BY app_push.idx ASC)) AS pidx FROM app_push \
        INNER JOIN admin ON admin.idx = app_push.adminIdx ORDER BY app_push.idx DESC LIMIT ?, ?";
    const results = await runQuery(sql, [start, count]);
    for (i in results) {
        results[i] = replaceDate(results[i]);
    }
    return results;
};

const getPushesCount = async () => {
    const sql = "select count(*) from app_push";
    const results = await runQuery(sql);
    return results[0]["count(*)"];
};

const insertPush = async (title, content, path, adminIdx) => {
    // Format the sendAt date using the replaceDate function if needed

    const sql =
        "insert INTO app_push (title, content, imagePath, adminIdx) VALUES (?, ?, ?, ?)";
    const params = [title, content, path, adminIdx];

    try {
        const result = await runQuery(sql, params);
        return result;
    } catch (err) {
        // Handle any errors that might occur during the database query
        console.error("Error inserting data:", err);
        throw err;
    }
};

const getPushAndAdminByIdx = async (idx) => {
    const sql =
        "select push.*, admin.id as admin_id, admin.name as admin_name, \
        admin.phone as admin_phone from app_push push \
        join admin on push.adminIdx = admin.idx where push.idx = ?";
    const results = await runQuery(sql, [idx]);
    return replaceDate(results[0]);
};

module.exports = {
    getPushes,
    getPushesCount,
    insertPush,
    getPushAndAdminByIdx,
};
