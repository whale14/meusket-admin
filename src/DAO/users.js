const { runQuery, runTransaction } = require("../lib/database");

const formatDate = (date) => {
    const yr = date.getFullYear();
    const mon =
        date.getMonth() + 1 > 9
            ? date.getMonth() + 1
            : "0" + (date.getMonth() + 1);
    const dt = date.getDate();
    return `${yr}-${mon}-${dt}`;
};

const replaceDate = (user, column) => {
    return formatDate(user[column]);
};

const getUserByIdx = async (idx) => {
    const sql =
        "select idx, id, name, createAt, updateAt, accountState, isWorkerRegist, profileImageUrl from user where idx = ?";
    const results = await runQuery(sql, [idx]);
    results[0]["updateAt"] = replaceDate(results[0], "updateAt");
    results[0]["createAt"] = replaceDate(results[0], "createAt");
    return results[0];
};

const getUserIdNameByIdx = async (idx) => {
    const sql = "select name, id from user where idx = ?";
    const result = await runQuery(sql, [idx]);
    return result[0];
};

const getUsersBySearch = async (
    type,
    id,
    start,
    count,
    sDate,
    eDate,
    user,
    helper,
    black,
    order
) => {
    let sql =
        "select idx, id, name, createAt, accountState, isWorkerRegist, (ROW_NUMBER() OVER (ORDER BY idx ASC)) AS pidx from user where idx > 0 ";
    const params = [];
    if (type && id) {
        sql += "and " + type + " like ?";
        params.push(`%${id}%`);
    }
    if (
        sDate !== undefined &&
        eDate !== undefined &&
        sDate != "" &&
        eDate != ""
    ) {
        sql += " and createAt >= ? and createAt <= ? ";
        params.push(sDate);
        params.push(eDate);
    }
    if (helper || black || user) {
        sql += " AND (";
        let isFirstCondition = true;

        if (helper) {
            sql += "isWorkerRegist = ?";
            params.push("1");
            isFirstCondition = false;
        }
        if (black) {
            if (!isFirstCondition) sql += " OR ";
            sql += "accountState = ?";
            params.push("1");
            isFirstCondition = false;
        }
        if (user) {
            if (!isFirstCondition) sql += " OR ";
            sql += "isWorkerRegist = ?";
            params.push("0");
        }
        sql += ") ";
    }

    sql += "order by ";
    if (order === undefined) sql += "idx";
    else sql += order;
    if (order == "createAt") sql += " desc";

    sql += " limit ?, ?";
    params.push(start);
    params.push(count);

    const results = await runQuery(sql, params);
    for (result of results) {
        result["createAt"] = replaceDate(result, "createAt");
    }
    return results;
};

const getUserTotalCount = async () => {
    const sql = "select count(*) from user where idx > 0";
    const results = await runQuery(sql);
    return results[0]["count(*)"];
};

const getUserSearchCount = async (
    id,
    type,
    sDate,
    eDate,
    user,
    helper,
    black
) => {
    let sql = "select count(*) from user where idx > 0 ";
    const params = [];
    if (type && id) {
        sql += "and " + type + " like ?";
        params.push(`%${id}%`);
    }
    if (sDate && eDate && sDate != "" && eDate != "") {
        sql += "and createAt >= ? and createAt <= ?";
        params.push(sDate);
        params.push(eDate);
    }
    if (helper || black || user) {
        sql += " AND (";
        let isFirstCondition = true;

        if (helper) {
            sql += "isWorkerRegist = ?";
            params.push("1");
            isFirstCondition = false;
        }
        if (black) {
            if (!isFirstCondition) sql += " OR ";
            sql += "accountState = ?";
            params.push("1");
            isFirstCondition = false;
        }
        if (user) {
            if (!isFirstCondition) sql += " OR ";
            sql += "isWorkerRegist = ?";
            params.push("0");
        }
        sql += ")";
    }
    const results = await runQuery(sql, params);
    return results[0]["count(*)"];
};

const updateUsertoBlack = async (idx, reason, period) => {
    const queries = [
        [
            "insert into blacklist (u_idx, createAt, reason, period)" +
                " select idx, CURRENT_TIMESTAMP(), ?, ?" +
                " from user WHERE idx = ?",
            [reason, period, idx],
        ],
        ["update user set accountState = 1 where idx = ?", [idx]],
    ];

    try {
        const results = await runTransaction(queries);
        const blacklistIdx = results[0].insertId;
        return blacklistIdx;
    } catch (err) {
        console.error("Error occurred during transaction:", err);
        return -1;
    }
};

const updateUserInfo = async (
    idx,
    id,
    name,
    bio,
    introduce,
    bank,
    accountNumber
) => {
    let sql = "update user set id = ?, name = ?,  updateAt=CURRENT_TIMESTAMP()";
    const params = [id, name];
    if (bio) {
        sql += ", bio = ?";
        params.push(bio);
    }
    if (introduce) {
        sql += ", introduce = ?";
        params.push(introduce);
    }
    if (bank) {
        sql += ", bankName = ?";
        params.push(bankName);
    }
    if (accountNumber) {
        sql += ", accountNumber = ?";
        params.push(accountNumber);
    }
    sql += " where idx = ?";
    params.push(idx);
    try {
        const queries = [
            [sql, params],
            [
                "select idx, id, name, createAt, updateAt, accountState, \
                isWorkerRegist, profileImageUrl from user where idx = ?",
                [idx],
            ],
        ];
        if (bio || introduce || bank || accountNumber)
            queries.push([
                "select bio, introduce, transportation, workCategory, \
                accountNumber, bankName from user where idx = ?",
                [idx],
            ]);

        const results = await runTransaction(queries);

        const updatedUser = results[1][0];
        updatedUser["updateAt"] = replaceDate(updatedUser, "updateAt");
        updatedUser["createAt"] = replaceDate(updatedUser, "createAt");
        if (bio || introduce || bank || accountNumber) {
            const updateHelper = results[2][0];
            return { updatedUser, updateHelper };
        }
        return { updatedUser };
    } catch (err) {
        return null;
    }
};

const getNewUserInOneMonth = async () => {
    const sql =
        "select count(*) from user where createAt\
    >= DATE_SUB(CURRENT_TIMESTAMP(), interval 30 DAY)";
    const results = await runQuery(sql, []);
    return results[0]["count(*)"];
};

const getUserUnregistered = async () => {
    const sql = "select count(*) from user where status = 0";
    const results = await runQuery(sql, []);
    return results[0]["count(*)"];
};

const getLastVisitorByPeriod = async (interval) => {
    const sql =
        "SELECT COUNT(DISTINCT u_idx) AS visitors \
        FROM ( SELECT u_idx, DATE(date) AS visit_date \
        FROM `order` WHERE date >= CURDATE() - INTERVAL ? DAY \
        UNION ALL SELECT req_u_idx, DATE(request_time) AS visit_date \
        FROM errandRequest WHERE request_time >= CURDATE() - INTERVAL ? DAY \
    ) AS visits";
    const results = await runQuery(sql, [interval, interval]);
    return results[0]["visitors"];
};

const getUsersCntByDate = async (startDate, endDate) => {
    const sql = `
        SELECT DATE(createAt) AS date, COUNT(*) AS count
        FROM user
        WHERE date(createAt) >= ? AND date(createAt) <= ?
        GROUP BY DATE(createAt)
    `;
    const params = [startDate, endDate];

    const results = await runQuery(sql, params);
    for (let i = 0; i < results.length; i++) {
        results[i].date = replaceDate(results[i], "date");
    }
    return results;
};

const deleteUser = async (idx, id) => {
    const queries = [
        ["update request set requesterIdx=0 where requesterIdx = ?", [idx]],
        ["update request set workerIdx=0 where workerIdx = ?", [idx]],
        ["delete from worker_approval where userIdx = ?", [idx]],
        ["delete from user where idx = ?", [idx]],
    ];
    try {
        await runTransaction(queries);
        return true; // Transaction succeeded
    } catch (error) {
        console.log(`Query at index ${error.queryIndex} failed.`);
        return false; // Transaction failed
    }
};

const getWalletbyIdx = async (idx) => {
    const sql = "select * from wallet where userIdx = ?";
    const result = await runQuery(sql, [idx]);
    return result[0];
};

const getCumulativeUserCount = async () => {
    const sql =
        "SELECT DATE(createAt) AS date, COUNT(*) AS cum_users \
    FROM user WHERE createAt <= NOW() GROUP BY DATE(createAt) ORDER BY DATE(createAt)";
    const results = await runQuery(sql);
    results[0].date = replaceDate(results[0], "date");
    for (let i = 1; i < results.length; i++) {
        results[i].cum_users += results[i - 1].cum_users;
        results[i].date = replaceDate(results[i], "date");
    }
    return results;
};

const getUsersFcmTokensByType = async () => {
    let sql = "select fcmToken from user where idx = 15 or idx = 16";
    const params = [];
    const results = await runQuery(sql, params);
    const fcmTokens = [];
    for (let result of results) {
        fcmTokens.push(result.fcmToken);
    }
    return fcmTokens;
};

module.exports = {
    getUserTotalCount,
    getUsersBySearch,
    getUserByIdx,
    getUserSearchCount,
    updateUsertoBlack,
    getNewUserInOneMonth,
    getUserUnregistered,
    getLastVisitorByPeriod,
    getUsersCntByDate,
    deleteUser,
    getUserIdNameByIdx,
    getWalletbyIdx,
    getCumulativeUserCount,
    updateUserInfo,
    getUsersFcmTokensByType,
};
