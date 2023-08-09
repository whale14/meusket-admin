const { runQuery, runTransaction } = require("../lib/database");

const getWorkCategoryByIdx = async (r_idx) => {
    const sql = "select idx, categoryName from work_category where idx  = ?";
    const result = await runQuery(sql, [r_idx]);

    if (result[0]) return result[0];
    else return undefined;
};

const getWorkRootCategory = async () => {
    const sql = "select * from work_category where idx=rootIndex";
    const results = await runQuery(sql);

    return results;
};

const getWorkCategoryByRootIdx = async (r_idx) => {
    const sql =
        "select idx, categoryName from work_category where rootIndex = ? and idx != rootIndex order by idx";
    const results = await runQuery(sql, [r_idx]);
    return results;
};

const updateWorkCategoryNameByIdxArray = async (idxArr, nameArr) => {
    try {
        const queries = [];
        const sql = "UPDATE work_category set categoryName = ? where idx = ?";
        for (let i = 0; i < idxArr.length; i++) {
            queries.push([sql, [nameArr[i], idxArr[i]]]);
        }
        await runTransaction(queries);
    } catch (err) {
        console.log(`Query at index ${error.queryIndex} failed.`);
        return err;
    }
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

module.exports = {
    getWorkCategoryByIdx,
    getWorkCategoryByRootIdx,
    getWorkRootCategory,
    updateWorkCategoryNameByIdxArray,
    getWorkCategory,
};
