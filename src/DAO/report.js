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

const formatDate2 = (date) => {
    const yr = date.getFullYear();
    const mon =
        date.getMonth() + 1 > 9
            ? date.getMonth() + 1
            : "0" + (date.getMonth() + 1);
    const dt = date.getDate();
    const hrs = date.getHours();
    const mins = date.getMinutes();
    return `${yr}.${mon}.${dt}  ${hrs}:${mins}`;
};

const replaceDate = (object, column, type) => {
    if (type == undefined || type == "1") return formatDate(object[column]);
    return formatDate2(object[column]);
};

const addUserID = async (object, col) => {
    const sql = "select id from user where idx = ?";
    let results = await runQuery(sql, [object[col]]);
    return results[0]["id"];
};

const getUserIdxbyId = async (id) => {
    sql = "select idx from user where id like ? or name like ?";
    const results = await runQuery(sql, [`%${id}%`, `%${id}%`]);
    if (results.length === 0) {
        return [{ idx: -1 }];
    }
    return results;
};

const getReportRequestList = async (
    start,
    count,
    sDate,
    eDate,
    status,
    sText,
    order
) => {
    let sql = "select * from report_request";
    const params = [];
    if (sDate != "" && eDate != "") {
        sql += " where reportDate >= ? AND reportDate <= ?";
        params.push(sDate);
        params.push(eDate);
    }
    if (status.some((item) => item.value === true)) {
        sql += " AND (";
        let isFirstCondition = true;
        for (i in status) {
            if (status[i].value == false) continue;
            if (!isFirstCondition) sql += " OR ";
            sql += "status = ?";
            params.push(status[i].key);
            isFirstCondition = false;
        }
        sql += ")";
    }

    if (sText != undefined && sText != "") {
        const sIdx = await getUserIdxbyId(sText);
        sql += " and reporterIdx in (";
        for (i in sIdx) {
            sql += " ?";
            if (i < sIdx.length - 1) {
                sql += ",";
            }
            params.push(sIdx[i]["idx"]);
        }
        sql += " )";
    }

    sql += " order by reportDate ";
    if (order) sql += order;
    else sql += "desc";
    sql += " limit ?, ?";
    params.push(start, count);
    const results = await runQuery(sql, params);
    for (i in results) {
        results[i].reportDate = replaceDate(results[i], "reportDate");
        results[i].id = await addUserID(results[i], "reporterIdx");
    }
    return results;
};

const getReportRequestCount = async (sDate, eDate, status, sText) => {
    let sql = "select count(*) as count from report_request";
    const params = [];
    if (sDate != "" && eDate != "") {
        sql += " where reportDate >= ? AND reportDate <= ?";
        params.push(sDate);
        params.push(eDate);
    }
    if (status.some((item) => item.value === true)) {
        sql += " AND (";
        let isFirstCondition = true;
        for (i in status) {
            if (status[i].value == false) continue;
            if (!isFirstCondition) sql += " OR ";
            sql += "status = ?";
            params.push(status[i].key);
            isFirstCondition = false;
        }
        sql += ")";
    }
    if (sText != undefined && sText != "") {
        const sIdx = await getUserIdxbyId(sText);
        sql += " and reporterIdx in (";
        for (i in sIdx) {
            sql += " ?";
            if (i < sIdx.length - 1) {
                sql += ",";
            }
            params.push(sIdx[i]["idx"]);
        }
        sql += " )";
    }

    const results = await runQuery(sql, params);

    return results[0]["count"];
};

const getReportRequestByIdx = async (idx) => {
    const sql = "select * from report_request where idx = ?";
    const results = await runQuery(sql, [idx]);
    results[0].reportDate = replaceDate(results[0], "reportDate", "2");
    return results[0];
};

const updateReportRequest = async (idx, sol) => {
    const sql =
        "update report_request set solution = ?, status = 1 where idx = ?";
    const results = await runQuery(sql, [sol, idx]);
    return results.changedRows >= 0 ? 1 : 0;
};

module.exports = {
    getReportRequestList,
    getReportRequestCount,
    getReportRequestByIdx,
    updateReportRequest,
};
