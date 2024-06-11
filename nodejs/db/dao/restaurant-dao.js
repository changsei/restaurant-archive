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

            const sql = `
            SELECT 
                r.restaurant_id,
                r.restaurant_name,
                r.restaurant_city,
                r.restaurant_district,
                r.restaurant_town,
                r.restaurant_street,
                r.restaurant_detail_address,
                r.restaurant_start_hours,
                r.restaurant_end_hours,
                r.restaurant_start_break_hours,
                r.restaurant_end_break_hours,
                r.restaurant_has_table,
                r.restaurant_has_takeout,
                r.restaurant_telephone,
                rt.restaurant_type
            FROM restaurant r
            JOIN restaurant_type rt ON r.restaurant_type_id = rt.restaurant_type_id
            WHERE r.restaurant_id = ?`;
            const params = [restaurantId];
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

    async addRestaurant(restaurantData) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sqlRestaurant = `
                INSERT INTO restaurant (
                    restaurant_name,
                    restaurant_type_id,
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
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const paramsRestaurant = [
                restaurantData.name,
                restaurantData.type,
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
            const [resultRestaurant] = await conn.query(sqlRestaurant, paramsRestaurant);
            const restaurantId = resultRestaurant.insertId;

            await conn.commit();
            return restaurantId;
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

    async searchRestaurants(restaurantData) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            let sql = `
                SELECT restaurant.*, COALESCE(restaurant_rating.average_rating, 0) as average_rating
                FROM restaurant
                LEFT JOIN restaurant_rating ON restaurant.restaurant_id = restaurant_rating.restaurant_id
                WHERE 1=1
            `;

            let params = [];

            // 조건에 따라 쿼리문을 추가합니다.
            if (restaurantData.rating > 0) {
                sql += ` AND restaurant_rating.average_rating >= ?`;
                params.push(restaurantData.rating);
            } 
            
            if (restaurantData.takeout !== "none") {
                sql += ` AND restaurant.restaurant_has_takeout = ?`;
                params.push(restaurantData.takeout === 'true');
            }

            if (restaurantData.table !== "none") {
                sql += ` AND restaurant.restaurant_has_table = ?`;
                params.push(restaurantData.table === 'true');
            }

            if (restaurantData.city !== "") {
                sql += ` AND LOWER(restaurant.restaurant_city) = LOWER(?)`;
                params.push(restaurantData.city.trim());
            }

            if (restaurantData.type > 0) {
                sql += ` AND restaurant.restaurant_type_id = ?`;
                params.push(restaurantData.type);
            }

            if (restaurantData.openHour > 0) {
                sql += ` AND restaurant.restaurant_start_hours <= ? AND restaurant.restaurant_end_hours >= ?`;
                params.push(restaurantData.openHour, restaurantData.openHour);
            }

            console.log(sql);

            const [restaurants] = await conn.query(sql, params);
            await conn.commit();
            return restaurants;
        } catch (error) {
            if (conn) await conn.rollback();
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    async deleteRestaurant(restaurantId) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            // restaurant 테이블에서 레코드 삭제
            const sqlDeleteRestaurant = `
                DELETE FROM restaurant WHERE restaurant_id = ?`;
            await conn.query(sqlDeleteRestaurant, [restaurantId]);

            await conn.commit();
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