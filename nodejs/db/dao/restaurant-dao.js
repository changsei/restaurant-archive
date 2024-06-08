const dbPool = require('../db-pool-creator');

class RestaurantDao {
    constructor() {
        this.dbPool = dbPool;
    }

    async findRestaurantById(restaurantId) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sql = `SELECT * FROM Restaurant WHERE restaurant_id = ?`;
            const params = [restaurantId];
            const [result] = await conn.query(sql, params);

            await conn.commit();
            return result.length  > 0 ? result[0] : null;
        } catch (error) {
            throw error;
        } finally {
            if (conn != null) {
                conn.release();
            }
        }
    }

    async addRestaurant(restaurantData) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();
    
            const sql = `
                INSERT INTO restaurant (
                    restaurant_name,
                    restaurant_start_hours,
                    restaurant_end_hours,
                    restaurant_start_break_hours,
                    restaurant_end_break_hours,
                    restaurant_has_table,
                    restaurant_has_takeout,
                    restaurant_city,
                    restaurant_district,
                    restaurant_town,
                    restaurant_street,
                    restaurant_detail_address,
                    restaurant_telephone
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const params = [
                restaurantData.name,
                restaurantData.startHours,
                restaurantData.endHours,
                restaurantData.startBreakHours,
                restaurantData.endBreakHours,
                restaurantData.hasTable,
                restaurantData.hasTakeout,
                restaurantData.city,
                restaurantData.district,
                restaurantData.town,
                restaurantData.street,
                restaurantData.detailAddress,
                restaurantData.telephone
            ];
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
}

module.exports = RestaurantDao; 