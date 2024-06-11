function viewReviewDetails(reviewId) {
    fetch(`/restaurant/main/review-my/${reviewId}`)
        .then(response => response.json())
        .then(reviewDtails => {
            const modalBody = document.querySelector('#editReviewModal .modal-body');
            modalBody.innerHTML = `
                <h5>가게 이름: ${reviewDtails.restaurant_name}</h5>
                <p>주소: ${reviewDtails.restaurant_city} ${reviewDtails.restaurant_district}</p>
                <p>점수: ${reviewDtails.review_score}</p>
                <p>리뷰 내용: ${reviewDtails.review_text}</p>
                <p>작성날짜: ${reviewDtails.review_created_at}</p>
                ${reviewDtails.photo_path ? `<img src="/${reviewDtails.photo_path}" class="img-thumbnail" alt="리뷰 사진">` : ''}
            `;
            // 모달에 데이터 저장 
            const editReviewModal = document.getElementById('editReviewModal');
            editReviewModal.setAttribute('data-review-id', reviewDtails.review_id);
            const reviewDetailsModal = new bootstrap.Modal(editReviewModal);
            reviewDetailsModal.show();
        })
        .catch(error => console.error('Error:', error));
}

function deleteReview() {
    const editReviewModal = document.getElementById('editReviewModal');
    const reviewId = editReviewModal.getAttribute('data-review-id');

    if (confirm('정말 이 리뷰를 삭제하시겠습니까?')) {
        fetch(`/restaurant/main/review-my-delete/${reviewId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reviewId: reviewId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === '리뷰 삭제 성공') {
                alert('리뷰가 성공적으로 삭제되었습니다.');
                // 모달 닫기
                const bootstrapModal = bootstrap.Modal.getInstance(editReviewModal);
                bootstrapModal.hide();
                // 삭제 후 리뷰 목록 갱신
                location.reload();
            } else {
                alert(`리뷰 삭제 실패: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('리뷰 삭제 중 오류가 발생했습니다.');
        });
    }
}