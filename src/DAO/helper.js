const { runQuery, runTransaction } = require("../lib/database");

const addUserID = async (object, col) => {
    const sql = "select id from user where idx = ?";
    let results = await runQuery(sql, [object[col]]);
    return results[0]["id"];
};

const getHelperByIdx = async (idx) => {
    const sql =
        "select bio, introduce, transportation, workCategory, accountNumber, bankName from user where idx = ?";
    const results = await runQuery(sql, [idx]);
    return results[0];
};

const getHelperApplyList = async (start, count) => {
    const sql =
        "select *, (ROW_NUMBER() OVER (ORDER BY idx ASC)) AS pidx from worker_approval order by idx limit ?, ?";
    const results = await runQuery(sql, [start, count]);
    for (i in results) {
        results[i].id = await addUserID(results[i], "userIdx");
    }
    return results;
};

const getHelperApplyTotalCount = async () => {
    const sql = "select count(*) from worker_approval";
    const results = await runQuery(sql);

    return results[0]["count(*)"];
};

const getHelperApplyByIdx = async (idx) => {
    const sql = "select * from worker_approval where idx = ?";
    const results = await runQuery(sql, [idx]);

    return results[0];
};

const updateWorkerToHelper = async (idx, recogNum) => {
    const queries = [
        [
            "update user JOIN worker_approval wa ON user.idx = wa.userIdx \
            SET user.accountName = wa.accountName, user.accountNumber = wa.accountNumber, \
            user.bankName = wa.bankName, user.introduce = wa.introduce, user.workCategory = wa.workCategory, \
            user.transportation = wa.transportation\
            WHERE wa.userIdx = ?",
            [idx],
        ],
        [
            "update user set recognitionNumber = ? where idx = ?",
            [recogNum, idx],
        ],
        ["update user set isWorkerRegist = 1 where idx = ?", [idx]],
        ["delete FROM worker_approval WHERE userIdx = ?", [idx]],
    ];
    const results = await runTransaction(queries);

    return results;
};

const getWorkCategory = async () => {
    const sql = "select * from work_category";
    const results = await runQuery(sql);

    for (i in results) {
        const root = parseInt(results[i].rootIndex);
        if (results[i].idx == results[i].rootIndex) {
            results[i].rootName = "";
        } else results[i].rootName = results[root].categoryName;
    }
    return results;
};

const getHelperTotalCount = async () => {
    const sql = "select count(*) from user where isWorkerRegist = 1";
    const results = await runQuery(sql);

    return results[0]["count(*)"];
};

const revokeHelperPosition = async (idx) => {
    try {
        const sql =
            "update user SET isWorkerRegist = 0, " +
            "bio = NULL, introduce = NULL, transportation = NULL " +
            "WHERE idx = ?";
        await runQuery(sql, [idx]);
        console.log(`Helper(idx:${idx}) revoke successfully`);
    } catch (err) {
        console.error(`Failed to revoke helper) ${err}`);
    }
};

module.exports = {
    getHelperByIdx,
    getHelperApplyList,
    getHelperApplyTotalCount,
    getHelperApplyByIdx,
    updateWorkerToHelper,
    getWorkCategory,
    getHelperTotalCount,
    revokeHelperPosition,
};
