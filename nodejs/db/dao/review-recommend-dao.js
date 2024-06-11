const dbPool = require('../db-pool-creator');

class ReviewRecommendDao {
    constructor() {
        this.dbPool = dbPool;
    }

    async deleteRecommendationsByReviewId(reviewId) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            const sql = `DELETE FROM review_recommends WHERE review_id = ?`;
            await conn.query(sql, [reviewId]);
        } catch (error) {
            throw error;
        } finally {
            if (conn != null) {
                conn.release();
            }
        }
    }
}

module.exports = ReviewRecommendDao;
