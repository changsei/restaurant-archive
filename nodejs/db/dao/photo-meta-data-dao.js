class PhotoMetaDataDao {
    constructor() {
        this.dbPool = require('../db-pool-creator');
    }

    async addPhotoMetaData(photoId, categoryId) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sqlPhotoMeta = `
                INSERT INTO photo_meta_data (photo_id, photo_category_id) VALUES (?, ?)`;
            const paramsPhotoMeta = [photoId, categoryId];
            await conn.query(sqlPhotoMeta, paramsPhotoMeta);

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

module.exports = PhotoMetaDataDao;