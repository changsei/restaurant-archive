const dbPool = require('../db-pool-creator');

class RestaurantPhotoDao {
    constructor() {
        this.dbPool = dbPool;
    }

    async addRestaurantPhoto(photoId, restaurantId, categoryId) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sqlRestaurantPhoto = `
                INSERT INTO restaurant_photo (photo_id, restaurant_id, photo_category_id) VALUES (?, ?, ?)`;
            const paramsRestaurantPhoto = [photoId, restaurantId, categoryId];
            await conn.query(sqlRestaurantPhoto, paramsRestaurantPhoto);
            await conn.commit();
            return true;
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

    async getPhotosByRestaurantId(restaurantId) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();

            const sqlGetPhotos = `
                SELECT photo_id FROM restaurant_photo WHERE restaurant_id = ?`;
            const [photos] = await conn.query(sqlGetPhotos, [restaurantId]);

            return photos;
        } catch (error) {
            throw error;
        } finally {
            if (conn != null) {
                conn.release();
            }
        }
    }

    async deleteRestaurantPhotosByRestaurantId(restaurantId) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sqlDeleteRestaurantPhotos = `
                DELETE FROM restaurant_photo WHERE restaurant_id = ?`;
            await conn.query(sqlDeleteRestaurantPhotos, [restaurantId]);

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

module.exports = RestaurantPhotoDao;
