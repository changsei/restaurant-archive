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

            const params = [
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
    
            // 평점 조건, 0이면 모든 평점 표시
            if (restaurantData.rating > 0) {
                sql += ` AND restaurant_rating.average_rating >= ?`;
                params.push(restaurantData.rating);
            } else {
                sql += ` AND restaurant_rating.average_rating IS NULL`;
            }
            
            // 테이크아웃 유무
            if (restaurantData.takeout !== "none") {
                sql += ` AND restaurant.restaurant_has_takeout = ?`;
                params.push(restaurantData.takeout === 'true');
            } 

            // 테이블 유무
            if (restaurantData.table !== "none") {
                sql += ` AND restaurant.restaurant_has_table = ?`;
                params.push(restaurantData.table === 'true');
            }
    
            // 도시 조건
            if (restaurantData.city !== "") {
                sql += ` AND LOWER(restaurant.restaurant_city) = LOWER(?)`; // 대소문자 구분 없이 도시 검색
                params.push(restaurantData.city.trim());
            }
    
            // 음식점 타입
            if (restaurantData.type > 0) {
                sql += ` AND restaurant.restaurant_type_id = ?`;
                params.push(restaurantData.type);
            }
    
            // 운영 시간
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
}

module.exports = RestaurantDao; 