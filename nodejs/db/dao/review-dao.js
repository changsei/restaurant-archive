const dbPool = require('../db-pool-creator');

class ReviewDAO {
    constructor() {
        this.dbPool = dbPool;
    }

    // 리뷰 추가
    async addReview(reviewData) {
        let conn;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sql = `
                INSERT INTO review (
                    user_id, 
                    restaurant_id, 
                    photo_id, 
                    photo_category_id, 
                    review_score, review_text, 
                    review_recommend, 
                    review_created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                reviewData.userId, 
                reviewData.restaurantId, 
                reviewData.photoId, 
                reviewData.photoCategoryId,
                reviewData.reviewScore, 
                reviewData.reviewText, 
                reviewData.reviewRecommend, 
                reviewData.reviewCreatedAt
            ];
            const [result] = await conn.query(sql, params);

            await conn.commit();
            return result;
        } catch (error) {
            if (conn) await conn.rollback();
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    // 리뷰 조회 (단일 리뷰)
    async getReviewById(reviewId) {
        let conn;
        try {
            conn = await this.dbPool.getConnection();
            const sql = `SELECT * FROM review WHERE review_id = ?`;
            const [result] = await conn.query(sql, [reviewId]);
            return result[0];
        } catch (error) {
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    // 리뷰 업데이트
    async updateReview(reviewId, updateData) {
        let conn;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sql = `
                UPDATE review SET
                    review_score = ?, review_text = ?, review_recommend = ?, review_created_at = ?
                WHERE review_id = ?
            `;
            const params = [
                updateData.reviewScore, updateData.reviewText, updateData.reviewRecommend, 
                updateData.reviewCreatedAt, reviewId
            ];
            const [result] = await conn.query(sql, params);

            await conn.commit();
            return result;
        } catch (error) {
            if (conn) await conn.rollback();
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    // 리뷰 삭제
    async deleteReview(reviewId) {
        let conn;
        try {
            conn = await this.dbPool.getConnection();
            await conn.beginTransaction();

            const sql = `DELETE FROM review WHERE review_id = ?`;
            const [result] = await conn.query(sql, [reviewId]);

            await conn.commit();
            return result;
        } catch (error) {
            if (conn) await conn.rollback();
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    // 유저가 작성한 모든 리뷰 조회
    async getReviewsByUserId(userId) {
        let conn;
        try {
            conn = await this.dbPool.getConnection();
            const sql = `SELECT * FROM review WHERE user_id = ?`;
            const [results] = await conn.query(sql, [userId]);
            return results;
        } catch (error) {
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    // 유저가 특정 음식점에서 작성한 리뷰 조회
    async getReviewByUserAndRestaurant(userId, restaurantId) {
        let conn;
        try {
            conn = await this.dbPool.getConnection();
            const sql = `SELECT * FROM review WHERE user_id = ? AND restaurant_id = ?`;
            const [result] = await conn.query(sql, [userId, restaurantId]);
            return result;
        } catch (error) {
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    // 특정 음식점에 대한 모든 리뷰 조회
    async getReviewsByRestaurant(restaurantId) {
        let conn;
        try {
            conn = await this.dbPool.getConnection();
            const sql = `SELECT * FROM review WHERE restaurant_id = ?`;
            const [results] = await conn.query(sql, [restaurantId]);
            return results;
        } catch (error) {
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = ReviewDAO;