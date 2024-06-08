class PhotoCategoryDao {
    constructor() {
        this.dbPool = require('../db-pool-creator');
    }

    async addPhotoCategory(categoryData) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sql = `INSERT INTO photo_category (
                            photo_category
                         ) VALUES (?)`;
            const params = [categoryData.photoCategory];
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

module.exports = PhotoCategoryDao;