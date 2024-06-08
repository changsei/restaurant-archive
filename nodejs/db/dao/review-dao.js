const dbPool = require('../db-pool-creator');

class ReviewDAO {
    constructor() {
        this.dbPool = dbPool;
    }

    async addReview(reviewData) {
        const sql = `INSERT INTO review (
                        user_id, 
                        restaurant_id, 
                        review_text, score, 
                        review_created_at
                        ) VALUES (?, ?, ?, ?, ?)`;
        try {
            const [result] = await this.dbPool.execute(sql, [
                    reviewData.userId, 
                    reviewData.restaurantId, 
                    reviewData.text, 
                    reviewData.score, 
                    reviewData.createdAt
                ]);
            return result;
        } catch (error) {
            console.error('Error in addReview:', error);
            throw error;
        }
    }
}

module.exports = ReviewDAO; 