const { resourceLimits } = require("worker_threads");
const { runQuery, runTransaction } = require("../lib/database");

const formatDate = (date) => {
    if (typeof date === "string") date = new Date(date);
    const yr = date.getFullYear();
    const mon = date.getMonth() + 1;
    const dt = date.getDate();
    const hrs = date.getHours();
    const mins = date.getMinutes();
    const secs = date.getSeconds();
    return `${yr}. ${mon}. ${dt} ${hrs}:${mins}:${secs}`;
};

const replaceDate = (object) => {
    if (object) {
        object.createAt = formatDate(object.createAt);
    }
    return object;
};

const getBlacksList = async (
    bType,
    bSearch,
    start,
    count,
    unblock,
    orderby
) => {
    let sql =
        "select u.id as u_id, u.name, b.isUnblock, b.idx, b.u_idx, b.createAt, b.reason, b.period\
        , (ROW_NUMBER() OVER (ORDER BY b.idx DESC)) AS pidx\
         from blacklist b join user u on b.u_idx=u.idx ";
    const params = [];
    if (bSearch != undefined && bSearch != "") {
        sql += "where u." + bType;
        if (bType == "idx") {
            sql += " = ?";
            params.push(bSearch);
        } else {
            sql += " like ?";
            params.push(`%${bSearch}%`);
        }
    }
    if (unblock) {
        sql += " and isUnblock = ?";
        params.push(unblock);
    }
    sql += " order by idx " + orderby + " limit ?, ?";
    params.push(start);
    params.push(count);
    const results = await runQuery(sql, params);
    for (let i = 0; i < results.length; i++) {
        if (results[i].u_id == "admin") {
            results[i].u_id = "deleted user";
            results[i].name = "deleted user";
        }
        results[i] = replaceDate(results[i]);
    }
    return results;
};

const getBlackTotalCount = async (bType, bSearch) => {
    let sql = "select count(*) from blacklist b join user u on b.u_idx=u.idx ";
    const params = [];
    if (bSearch != undefined && bSearch != "") {
        sql += "where u. " + bType + " like ?";
        params.push(`%${bSearch}%`);
    }
    const results = await runQuery(sql, params);
    return results[0]["count(*)"];
};

const deleteRidBlackByUidx = async (idx) => {
    const queries = [
        ["update user set accountState = 0 where idx = ?", [idx]],
        ["update blacklist set isUnblock = 1 WHERE u_idx = ?", [idx]],
    ];
    const results = await runTransaction(queries);

    return results;
};

const getUnexpiredBlacks = async () => {
    const sql =
        "select idx, u_idx, createAt, period from blacklist where isUnblock != 1 and period != 'INF'";
    const results = await runQuery(sql, []);
    return results;
};

const getDuplicatedBlackCount = async (count) => {
    const sql =
        "SELECT COUNT(*) AS duplicated_count \
        FROM ( SELECT u_idx, COUNT(u_idx) AS occurrence_count \
        FROM blacklist GROUP BY u_idx \
        HAVING COUNT(u_idx) >= ?) AS subquery";
    const results = await runQuery(sql, [count]);

    return results[0]["duplicated_count"];
};

const getCurrBlackCnt = async () => {
    const sql = "select count(*) from blacklist where isUnblock = 0";
    const results = await runQuery(sql);
    return results[0]["count(*)"];
};

const getCountByIdx = async (idx) => {
    const sql = "select count(*) from blacklist where u_idx = ?";
    const results = await runQuery(sql, [idx]);
    return results[0]["count(*)"];
};

const getBlackByIdx = async (idx) => {
    const sql = "select * from blacklist where idx = ?";
    const results = await runQuery(sql, [idx]);
    return results[0];
};

const updateBlack = async (idx, period, reason, unblock) => {
    var sql = "update blacklist set, createAt = CURRENT_TIMESTAMP() period = ?";
    const params = [period];
    if (reason) {
        sql += ", reason = ?";
        params.push(reason);
    }
    if (unblock) {
        sql += ", isUnblock = ?";
        params.push(unblock);
    }
    sql += " where idx = ?";
    params.push(idx);
    try {
        const results = await runQuery(sql, params);
        const blackRow = await runQuery(
            "SELECT u_idx, createAt, period FROM blacklist WHERE idx = ?",
            [idx]
        );
        const { u_idx, createAt, blackPeriod } = blackRow[0];
        const unblockDate = new Date(
            createAt.getTime() + blackPeriod * 24 * 60 * 60 * 1000
        );
        const currentDate = new Date();
        if (unblockDate <= currentDate) {
            const queries = [
                ["UPDATE user SET accountState = 0 WHERE idx = ?", [u_idx]],
                ["UPDATE blacklist SET isUnblock = 1 WHERE idx = ?", [idx]],
            ];
            await runTransaction(queries);
        }
        return 0;
    } catch (err) {
        return -1;
    }
};

module.exports = {
    getBlacksList,
    getBlackTotalCount,
    deleteRidBlackByUidx,
    getUnexpiredBlacks,
    getDuplicatedBlackCount,
    getCurrBlackCnt,
    getCountByIdx,
    getBlackByIdx,
    updateBlack,
};
