const { runQuery } = require("../lib/database");

const getAdminAuthorityByIdx = async (idx) => {
    const sql = "select authority from admin where idx = ?";
    const results = await runQuery(sql, [idx]);
    return results[0]["authority"];
};

const getAdminById = async (id) => {
    const sql = "select * from admin where id = ?";
    const results = await runQuery(sql, [id]);
    return results[0];
};

const createAdminAccount = async (id, name, password, phone) => {
    try {
        const sql =
            "insert into admin (id, name, phone, password) values (?, ?, ?, ?)";
        await runQuery(sql, [id, name, phone, password]);
        console.log("Admin Account Created!");
        return 1;
    } catch (err) {
        return 0;
    }
};

const getAdminList = async (start, count, authority) => {
    let sql =
        "select idx, authority, name, id, (ROW_NUMBER() OVER (ORDER BY idx DESC)) AS pidx from admin ";
    const params = [];
    if (authority) {
        if (authority.some((item) => item.value === true)) {
            sql += "where";
            let isFirstCondition = true;
            for (i in authority) {
                if (authority[i].value == false) continue;
                if (!isFirstCondition) sql += " OR ";
                sql += "authority = ?";
                params.push(authority[i].key);
                isFirstCondition = false;
            }
        }
    }
    sql += " order by idx DESC limit ?, ?";

    params.push(start);
    params.push(count);

    const results = await runQuery(sql, params);
    for (i in results) {
        author = results[i].authority;
        if (author == 1) results[i].author = "최고 관리자";
        else if (author == 2) results[i].author = "중간 관리자";
        else if (author == 3) results[i].author = "하위 관리자";
        else results[i].author = "권한 승인 필요";
    }
    return results;
};

const getAdminCount = async (authority) => {
    let sql = "select count(*) from admin ";
    const params = [];
    if (authority) {
        if (authority.some((item) => item.value === true)) {
            sql += "where";
            let isFirstCondition = true;
            for (i in authority) {
                if (authority[i].value == false) continue;
                if (!isFirstCondition) sql += " OR ";
                sql += "authority = ?";
                params.push(authority[i].key);
                isFirstCondition = false;
            }
        }
    }
    const results = await runQuery(sql, params);
    return results[0]["count(*)"];
};

const updateAdminAuthority = async (idx, authority) => {
    const sql = "update admin set authority = ? where idx = ?";
    const results = await runQuery(sql, [authority, idx]);

    if (results.affectedRows > 0) {
        return 1; // 성공적으로 업데이트되었을 경우
    } else {
        return 0; // 업데이트 실패
    }
};

const getAdminIdxById = async (id) => {
    const sql = "select idx from admin where id = ?";
    const results = await runQuery(sql, [id]);
    return results[0]["idx"];
};

module.exports = {
    getAdminAuthorityByIdx,
    createAdminAccount,
    getAdminById,
    getAdminList,
    getAdminCount,
    updateAdminAuthority,
    getAdminIdxById,
};
