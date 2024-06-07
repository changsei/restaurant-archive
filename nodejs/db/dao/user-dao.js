const dbPool = require('../db-pool-creator');

class UserDao {
    constructor() {
        this.dbPool = dbPool;
    }

    async insertUser(userData) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sql = `INSERT INTO User (user_id, user_nick_name, user_password_hash, user_email, user_created_at) VALUES (?, ?, ?, ?, ?)`;
            const params = [userData.userId, userData.nickName, userData.passwordHash, userData.email, userData.createdAt];
            const [result] = await conn.query(sql, params);

            await conn.commit();
            return result;
        } catch (error) {
            if (conn) {
                await conn.rollback();
            }
            throw error;
        } finally {
            if (conn != null) {
                conn.release();
            }
        }
    }
    
    async findUserByIdAndPassword(userId, passwordHash) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sql = `SELECT * FROM User WHERE user_id = ? AND user_password_hash = ?`;
            const params = [userId, passwordHash];
            const [result] = await conn.query(sql, params);

            await conn.commit();
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw error;
        } finally {
            if (conn != null) {
                conn.release();
            }
        }
    }
}

module.exports = UserDao;