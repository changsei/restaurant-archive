const dbPool = require('../db-pool-creator');

class PhotoDao {
    constructor() {
        this.dbPool = dbPool;
    }

    async addPhoto(photoData) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sqlPhoto = `
                INSERT INTO photo (photo_path, photo_name, photo_type) VALUES (?, ?, ?)`;
            const paramsPhoto = [photoData.path, photoData.name, photoData.type];
            const [resultPhoto] = await conn.query(sqlPhoto, paramsPhoto);

            await conn.commit();
            return resultPhoto.insertId;
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

    async deletePhoto(photoId) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sqlDeletePhoto = `
                DELETE FROM photo WHERE photo_id = ?`;
            await conn.query(sqlDeletePhoto, [photoId]);

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

    async getPhotosByRestaurantId(restaurantId) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();

            const sqlGetPhotos = `
                SELECT p.photo_id, p.photo_path
                FROM restaurant_photo rp
                JOIN photo p ON rp.photo_id = p.photo_id
                WHERE rp.restaurant_id = ?`;
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

    async getPhotoById(photoId) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();

            const sqlGetPhoto = `
                SELECT photo_path
                FROM photo
                WHERE photo_id = ?`;
            const [photo] = await conn.query(sqlGetPhoto, [photoId]);

            return photo.length > 0 ? photo[0] : null;
        } catch (error) {
            throw error;
        } finally {
            if (conn != null) {
                conn.release();
            }
        }
    }
}

module.exports = PhotoDao;
