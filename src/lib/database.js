const mysql = require("mysql2/promise");
const logger = require("./logger");

const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env;

const pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
});

const runQuery = async (pstmt, data) => {
    const conn = await pool.getConnection();
    try {
        const sql = conn.format(pstmt, data);
        if (isDatabaseChangeOperation(pstmt)) {
            console.log("Executing SQL query:", sql);
            logger.info("Executing SQL query:", { message: sql });
        }
        const [result] = await conn.query(sql);
        return result;
    } finally {
        conn.release();
    }
};

const runTransaction = async (queries) => {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
        const results = [];
        for (let i = 0; i < queries.length; i++) {
            const [pstmt, data] = queries[i];
            const sql = conn.format(pstmt, data);
            if (isDatabaseChangeOperation(pstmt)) {
                console.log("Executing SQL query:", sql);
                logger.info("Executing SQL query:", { message: sql });
            }
            try {
                const [result] = await conn.query(sql);
                results.push(result);
            } catch (error) {
                logger.error("Error in transaction at queryIndex:", {
                    queryIndex: error.queryIndex,
                    message: error.error,
                });
                throw { queryIndex: i, error };
            }
        }
        await conn.commit();
        return results;
    } catch (error) {
        logger.error("");
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

const isDatabaseChangeOperation = (pstmt) => {
    // INSERT 문인 경우
    if (pstmt.trim().startsWith("insert")) {
        return true;
    }
    // UPDATE 문인 경우
    if (pstmt.trim().startsWith("update")) {
        return true;
    }
    // DELETE 문인 경우
    if (pstmt.trim().startsWith("delete")) {
        return true;
    }
    // 이 외의 경우는 변경 작업이 아닌 것으로 판단
    return false;
};

module.exports = { runQuery, runTransaction };
