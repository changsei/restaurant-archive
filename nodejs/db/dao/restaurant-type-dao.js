
const dbPool = require('../db-pool-creator');

class RestaurantTypeDao {
    constructor() {
        this.dbPool = dbPool;
    }

    async getAllRestaurantTypes() {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            const sql = 'SELECT * FROM restaurant_type';
            const [types] = await conn.query(sql);
            return types;
        } catch (error) {
            throw error;
        } finally {
            if (conn) {
                conn.release();
            }
        }
    }
}

module.exports = RestaurantTypeDao;