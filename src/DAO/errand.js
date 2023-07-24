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
        if (object.regDate) object.regDate = formatDate(object.regDate, type);
        if (object.workDate)
            object.workDate = formatDate(object.workDate, type);
    }
    return object;
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

const getErrandsList = async (
    start,
    count,
    sDate,
    eDate,
    status,
    rootCatIdx,
    catIdx,
    sType,
    sText
) => {
    // 0,1 wating matching(0: normal request, 1: request user chosse specific helper)
    // 2: waiting starting, 3: progressing request
    // 4: errand complete, 5: errand cancel
    let sql =
        "select *, (ROW_NUMBER() OVER (ORDER BY idx ASC)) AS pidx from request";
    const params = [];
    if (sDate != "" && eDate != "") {
        sql += " where regDate >= ? AND regDate <= ?";
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
    if (rootCatIdx >= 0) {
        sql += " and  workCategoryIdx = ?";
        if (rootCatIdx == catIdx || catIdx < 0) {
            params.push(rootCatIdx);
            const categoryIdx = await getWorkCategoryByRootIdx(rootCatIdx);
            for (i in categoryIdx) {
                sql += " or workCategoryIdx = ?";
                params.push(categoryIdx[i]["idx"]);
            }
        } else {
            params.push(catIdx);
        }
    }
    if (sText != undefined && sText != "") {
        const sIdx = await getUserIdxbyId(sText);
        sql += " and " + sType + " in (";
        for (i in sIdx) {
            sql += " ?";
            if (i < sIdx.length - 1) {
                sql += ",";
            }
            params.push(sIdx[i]["idx"]);
        }
        sql += ")";
    }
    sql += " order by idx DESC limit ?, ?";

    params.push(start);
    params.push(count);

    const results = await runQuery(sql, params);
    for (let i = 0; i < results.length; i++) {
        results[i] = replaceDate(results[i], "ymd");
        results[i].u_id = await addUserID(results[i], "requesterIdx");
        results[i].h_id = await addUserID(results[i], "workerIdx");
    }
    return results;
};

const getErrandsCount = async (
    sDate,
    eDate,
    status,
    rootCatIdx,
    catIdx,
    sType,
    sText
) => {
    let sql = "select count(*) from request";
    const params = [];
    if (
        sDate != "" ||
        eDate != "" ||
        status.some((item) => item.value === true)
    )
        sql += " where";
    if (sDate != "" && eDate != "") {
        sql += " regDate >= ? AND regDate <= ?";
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
    if (rootCatIdx >= 0) {
        sql += " and  workCategoryIdx = ?";
        if (rootCatIdx == catIdx || catIdx < 0) {
            params.push(rootCatIdx);
            const categoryIdx = await getWorkCategoryByRootIdx(rootCatIdx);
            for (i in categoryIdx) {
                sql += " or workCategoryIdx = ?";
                params.push(categoryIdx[i]["idx"]);
            }
        } else {
            params.push(catIdx);
        }
    }
    if (sText != undefined && sText != "") {
        const sIdx = await getUserIdxbyId(sText);
        sql += " and " + sType + " in (";
        for (i in sIdx) {
            sql += " ?";
            if (i < sIdx.length - 1) {
                sql += ",";
            }
            params.push(sIdx[i]["idx"]);
        }
        sql += ")";
    }

    const results = await runQuery(sql, params);

    return results[0]["count(*)"];
};

const getErrandByIdx = async (idx) => {
    const sql = "select * from request where idx = ?";
    const results = await runQuery(sql, [idx]);

    replaceDate(results[0]);
    results[0].u_id = await addUserID(results[0], "requesterIdx");
    results[0].h_id = await addUserID(results[0], "workerIdx");
    return results[0];
};

const getReviewByIdx = async (idx) => {
    const sql =
        "select request_review.*, request.requesterIdx as req_idx, request.workerIdx as work_idx from request_review inner join request on request_review.requestIdx=request.idx where requestIdx = ?";
    const results = await runQuery(sql, [idx]);
    for (i in results) {
        if (results[i]["reviewerIdx"] == results[i]["req_idx"])
            results[i].type = "부름이";
        else results[i].type = "드림이";
    }
    return results;
};

const getErrandsByUserIdx = async (requesterIdx) => {
    const sql = "select * from request where requesterIdx = ?";
    const results = await runQuery(sql, [requesterIdx]);
    for (let i = 0; i < results.length; i++) {
        results[i] = replaceDate(results[i]);
        results[i].h_id = await addUserID(results[i], "workerIdx");
    }
    return results;
};

const getTotalErrandCount = async () => {
    const sql =
        "SELECT IFNULL(status, 10) as status, COUNT(*) AS requestCount FROM request \
    GROUP BY status WITH ROLLUP";
    const results = await runQuery(sql);
    return results;
};

const getErrandsByHelperIdx = async (workerIdx) => {
    const sql = "select * from request where workerIdx = ?";
    const results = await runQuery(sql, [workerIdx]);
    for (let i = 0; i < results.length; i++) {
        results[i] = replaceDate(results[i]);
        results[i].u_id = await addUserID(results[i], "requesterIdx");
    }
    return results;
};

const getIsRejectedByIdx = async (r_idx) => {
    const sql =
        "select isRejected from request_recruitment where requestIdx = ?";
    const result = await runQuery(sql, [r_idx]);

    return result[0].isRejected;
};

const getWorkCategoryByIdx = async (r_idx) => {
    const sql = "select idx, categoryName from work_category where idx  = ?";
    const result = await runQuery(sql, [r_idx]);

    if (result[0]) return result[0]["categoryName"];
    else return undefined;
};

const getWorkRootCategory = async () => {
    const sql = "select * from work_category where idx=rootIndex";
    const results = await runQuery(sql);

    return results;
};

const getWorkCategoryByRootIdx = async (r_idx) => {
    const sql =
        "select idx, categoryName from work_category where rootIndex = ? order by idx";
    const results = await runQuery(sql, [r_idx]);
    return results;
};

const getRecruitmentByIdx = async (e_idx) => {
    const sql = "select * from request_recruitment where requestIdx = ?";
    const results = await runQuery(sql, e_idx);

    for (i in results) {
        results[i].h_id = await addUserID(results[i], "userIdx");
    }
    return results;
};

const getManyErrandsUserTop5 = async (type) => {
    //type -> 부름이 or 드림이
    const sql =
        "select count(*) as cnt, " +
        type +
        " as idx from request where status = 4 group by " +
        type +
        " order by cnt desc limit 0, 5";
    results = await runQuery(sql);
    for (i in results) {
        results[i].id = await addUserID(results[i], "idx");
    }
    return results;
};

const getMuchMoneyUserTop5 = async (type) => {
    const sql =
        "select sum(reward) as sum, " +
        type +
        " as idx from request where status = 4 group by " +
        type +
        " order by sum desc limit 0, 5";
    const results = await runQuery(sql);
    for (i in results) {
        results[i].id = await addUserID(results[i], "idx");
    }
    return results;
};

const getErrandNumAndSum = async () => {
    const sql =
        "SELECT AVG(count) AS avg_count, AVG(total_pay) AS avg_total \
        FROM ( SELECT workerIdx, COUNT(*) AS count, SUM(reward) AS total_pay FROM request \
        WHERE status = 4 GROUP BY workerIdx ) AS subquery";
    const results = await runQuery(sql);
    return results[0];
};

const getErrandReviewAvgScore = async (type) => {
    const sql =
        "SELECT  toIdx as idx, avg(rev.score) as score FROM request as req \
    INNER JOIN request_review as rev ON req.idx = rev.requestIdx where req." +
        type +
        " = toIdx group by toIdx order by score desc limit 0, 5";
    const results = await runQuery(sql);
    for (i in results) {
        results[i].id = await addUserID(results[i], "idx");
        results[i].score = parseInt(results[i].score * 10) / 10;
    }
    return results;
};

const getTopDoneErrands = async () => {
    const sql =
        "SELECT workCategoryIdx, rootIndex, categoryName, COUNT(*) AS count \
        FROM request inner join work_category on workCategoryIdx = work_category.idx \
        GROUP BY workCategoryIdx order by count desc limit 0, 1";
    const results = await runQuery(sql);
    return results[0];
};

const getTopDoneRootErrands = async () => {
    const sql =
        "SELECT COUNT(*) AS count, rootIndex FROM request \
    inner join work_category on workCategoryIdx = work_category.idx \
    GROUP BY rootIndex order by count desc limit 0,1";
    const results = await runQuery(sql);
    const root = results[0];
    root.categoryName = await getWorkCategoryByIdx(root["rootIndex"]);
    return root;
};

const getCntErrandForWeek = async () => {
    const sql =
        "SELECT SUM(subquery.count) AS count, DAYNAME(subquery.date) AS day_of_week \
        FROM ( \
            SELECT COUNT(*) AS count, DATE_FORMAT(er.regDate, '%Y-%m-%d') AS date \
            FROM request er GROUP BY date \
        ) AS subquery GROUP BY day_of_week";
    const results = await runQuery(sql);

    const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    const resultWithZero = weekdays.map((day) => {
        const found = results.find((result) => result.day_of_week === day);
        return { count: found ? parseInt(found.count) : 0, day_of_week: day };
    });

    return resultWithZero;
};

const getCntErrandForHour = async () => {
    const sql =
        "SELECT COUNT(*) AS count, CONCAT(FLOOR(HOUR(er.regDate)/2) * 2, '시-', FLOOR(HOUR(er.regDate)/2) * 2 + 2, '시') AS hour_range \
        FROM request er \
        WHERE HOUR(er.regDate) < 23 \
        GROUP BY hour_range";
    const results = await runQuery(sql);
    const hours = Array.from(
        { length: 12 },
        (_, index) => `${index * 2}시-${index * 2 + 2}시`
    );

    // 결과에 없는 시간대에 0 추가
    const resultWithZero = hours.map((hour) => {
        const found = results.find((result) => result.hour_range === hour);
        return { count: found ? found.count : 0, hour_range: hour };
    });

    return resultWithZero;
};

const getMostExtremeCategory = async (type) => {
    const sql =
        "select avg(reward) as avg, categoryName, rootIndex, workCategoryIdx from request \
    inner join work_category on workCategoryIdx = work_category.idx \
    group by workCategoryIdx order by avg " +
        type +
        " limit 0, 1";
    const results = await runQuery(sql);
    results[0].avg = parseInt(results[0].avg);
    return results[0];
};

const getUserReveiwByUserIdx = async (idx, type) => {
    const sql =
        "select toIdx, requestIdx as r_idx, comment, req.requesterIdx, req.workerIdx \
        from request_review inner join request as req on req.idx = requestIdx \
        and req." +
        type +
        " = toIdx where toIdx = ? order by score desc";
    const results = await runQuery(sql, [idx]);
    return results;
};

const getCntForRewardRange = async () => {
    const sql =
        "SELECT CASE \
        WHEN reward < 3000 THEN '0 - 2999' \
        WHEN reward >= 3000 AND reward < 6000 THEN '3000 - 5999' \
        WHEN reward >= 6000 AND reward < 10000 THEN '6000 - 9999' \
        WHEN reward >= 10000 AND reward < 20000 THEN '10000 - 19999' \
        ELSE '20000 이상' \
    END AS reward_range, COUNT(*) AS count FROM request GROUP BY reward_range \
    ORDER BY \
        CASE reward_range \
        WHEN '0 - 2999' THEN 1 \
        WHEN '3000 - 5999' THEN 2 \
        WHEN '6000 - 9999' THEN 3 \
        WHEN '10000 - 19999' THEN 4 \
        ELSE 5 END";
    const results = await runQuery(sql);
    return results;
};

const getTotalErrandRewardByStatus = async () => {
    const sql =
        "SELECT SUM(CASE WHEN status = 4 THEN reward ELSE 0 END) AS rewardSum, SUM(reward) AS totalRewardSum FROM request";
    const results = await runQuery(sql);
    return results[0];
};

module.exports = {
    getErrandsList,
    getErrandsCount,
    getErrandByIdx,
    getReviewByIdx,
    getErrandsByUserIdx,
    getTotalErrandCount,
    getErrandsByHelperIdx,
    getIsRejectedByIdx,
    getWorkCategoryByIdx,
    getWorkRootCategory,
    getWorkCategoryByRootIdx,
    getRecruitmentByIdx,
    getManyErrandsUserTop5,
    getMuchMoneyUserTop5,
    getErrandNumAndSum,
    getErrandReviewAvgScore,
    getTopDoneErrands,
    getTopDoneRootErrands,
    getCntErrandForWeek,
    getCntErrandForHour,
    getMostExtremeCategory,
    getUserReveiwByUserIdx,
    getCntForRewardRange,
    getTotalErrandRewardByStatus,
};
