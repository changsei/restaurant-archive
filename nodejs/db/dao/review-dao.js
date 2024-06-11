const dbPool = require('../db-pool-creator');

class ReviewDAO {
    constructor() {
        this.dbPool = dbPool;
    }

    async getReviewById(reviewId) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            const sql = `SELECT * FROM review WHERE review_id = ?`;
            const [result] = await conn.query(sql, reviewId);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw error;
        } finally {
            if (conn != null) {
                conn.release();
            }
        }
    }
    async getReviewsByRestaurantId(restaurantId, skipSize, contentSize) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            const query = `
                SELECT r.*, res.restaurant_name, res.restaurant_city, res.restaurant_district
                FROM review r
                JOIN restaurant res ON r.restaurant_id = res.restaurant_id
                WHERE r.restaurant_id = ?
                LIMIT ?, ?
                `;
    
            const [reviews] = await conn.execute(query, [restaurantId, skipSize, contentSize]);
            const countQuery = `
            SELECT COUNT(*) as total
            FROM review
            WHERE restaurant_id = ?
            `;
    
            const [countResult] = await conn.execute(countQuery, [restaurantId]);
            const totalReviews = countResult[0].total;
    
            return { reviews, totalReviews };
        } catch (error) {
            throw error;
        } finally {
            if (conn != null) {
                conn.release();
            }
        }
    }
    

    async getReviewsByUserIdWithRestaurant(userId) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            const sql = `
                SELECT 
                    r.review_id,
                    r.restaurant_id,
                    r.review_text,
                    r.review_created_at,
                    res.restaurant_name,
                    res.restaurant_city,
                    res.restaurant_district
                FROM review r
                JOIN restaurant res ON r.restaurant_id = res.restaurant_id
                WHERE r.user_id = ?
            `;
            const [results] = await conn.query(sql, [userId]);
            return results;
        } catch (error) {
            throw error;
        } finally {
            if (conn != null) {
                conn.release();
            }
        }
    }

    async deleteReview(reviewId) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            const sql = `DELETE FROM review WHERE review_id = ?`;
            await conn.query(sql, [reviewId]);
        } catch (error) {
            throw error;
        } finally {
            if (conn != null) {
                conn.release();
            }
        }
    }

    async addReview(reviewData) {
        let conn = null;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sql = `
                INSERT INTO review (
                    user_id, restaurant_id, photo_id, photo_category_id, review_score, review_text, review_recommend, review_created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            const params = [
                reviewData.userId,
                reviewData.restaurantId,
                reviewData.photoId,
                reviewData.photoCategoryId,
                reviewData.score,
                reviewData.reviewText,
                reviewData.recommended,
                reviewData.createdAt
            ];

            await conn.query(sql, params);
            await conn.commit();
        } catch (error) {
            if (conn != null) {
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

module.exports = ReviewDAO;