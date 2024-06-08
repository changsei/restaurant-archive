class PhotoDao {
    constructor() {
        this.dbPool = require('../db-pool-creator');
    }

    async addPhoto(photoData) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sql = `INSERT INTO photo (
                            photo_path, 
                            photo_name, 
                            photo_type
                         ) VALUES (?, ?, ?)`;
            const params = [
                photoData.photoPath,
                photoData.photoName,
                photoData.photoType
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

module.exports = PhotoDao;