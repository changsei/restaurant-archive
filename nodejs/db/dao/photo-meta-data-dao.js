class PhotoMetaDataDao {
    constructor() {
        this.dbPool = require('../db-pool-creator');
    }

    async addPhotoMetaData(metaData) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sql = `INSERT INTO photo_meta_data (
                            photo_id, 
                            photo_category_id
                         ) VALUES (?, ?)`;
            const params = [
                metaData.photoId, 
                metaData.photoCategoryId
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

module.exports = PhotoMetaDataDao;