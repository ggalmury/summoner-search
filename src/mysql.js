// mysql2 -> promise 기반 (await) /callback 기반 (callback 함수를 통해 가져올 수 있음)
const mysql = require("mysql2/promise");
const mysqlConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const pool = mysql.createPool(mysqlConfig);

const __database__ = {
  getConnection: async function () {
    try {
      const conn = await pool.getConnection();

      return {
        release: () => {
          conn.release();
        },
        query: (sql, values) => {
          console.info(`[Database] - Query: ` + mysql.format(sql, values));
          return conn.query(sql, values);
        },
        beginTransaction: () => {
          console.info(`[Database] - Begin transaction`);
          return conn.beginTransaction();
        },
        commit: () => {
          console.info(`[Database] - Commit`);
          return conn.commit();
        },
        rollback: () => {
          console.warn(`[Database] - Rollback`);
          return conn.rollback();
        },
      };
    } catch (e) {
      throw e;
    }
  },
  query: async (sql, values = []) => {
    let conn = null;

    try {
      conn = await __database__.getConnection();
    } catch (err) {
      throw err;
    }

    try {
      let [results] = await conn.query(sql, values);
      return results;
    } catch (err) {
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = __database__;
