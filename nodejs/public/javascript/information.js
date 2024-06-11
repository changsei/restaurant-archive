function loadReviews(restaurantId, pageNum) {
    console.log(`Fetching reviews for restaurantId: ${restaurantId}, pageNum: ${pageNum}`);

    fetch(`/restaurant/main/review-list/${restaurantId}?page=${pageNum}`)
        .then(response => response.json())
        .then(data => {
            console.log(`Fetched reviews: ${JSON.stringify(data)}`);

            const reviewContainer = document.getElementById('reviewContainer');
            reviewContainer.innerHTML = '';

            data.reviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.className = 'list-group-item flex-column align-items-start btn-toggle';
                reviewElement.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1 font-weight-bold">가게 이름: ${review.restaurant_name}</h5>
                        <small>작성 날짜: ${review.review_created_at}</small>
                    </div>
                    <p class="mb-1">작성 내용: ${review.review_text}</p>
                    <button class="btn btn-link" onclick="viewReviewDetails('${review.review_id}')">자세히 보기</button>
                `;
                reviewContainer.appendChild(reviewElement);
            });

            const pagination = document.getElementById('pagination');
            pagination.innerHTML = '';
            for (let i = 1; i <= data.pagination.totalPage; i++) {
                const pageItem = document.createElement('li');
                pageItem.className = `page-item ${i === data.pagination.page ? 'active' : ''}`;
                pageItem.innerHTML = `<a class="page-link" href="#" onclick="event.preventDefault(); loadReviews('${restaurantId}', ${i})">${i}</a>`;
                pagination.appendChild(pageItem);
            }
        })
        .catch(error => {
            console.error('Error fetching reviews:', error);
        });
}

function viewReviewDetails(reviewId) {
    fetch(`/restaurant/main/review-my/${reviewId}`)
        .then(response => response.json())
        .then(review => {
            const modalBody = document.querySelector('#editReviewModal .modal-body');
            modalBody.innerHTML = `
                <h5>가게 이름: ${review.restaurant_name}</h5>
                <p>주소: ${review.restaurant_city} ${review.restaurant_district}</p>
                <p>평점: ${review.review_score}</p>
                <p>리뷰: ${review.review_text}</p>
                <p>작성날짜: ${review.review_created_at}</p>
                ${review.photo_path ? `<img src="/${review.photo_path}" class="img-thumbnail" alt="리뷰 사진">` : ''}
            `;
            const reviewDetailsModal = new bootstrap.Modal(document.getElementById('editReviewModal'));
            reviewDetailsModal.show();
        })
        .catch(error => console.error('Error:', error));
}

function deleteRestaurant(restaurantId) {
    fetch('/restaurant/main/resturant-delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ restaurantId: restaurantId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Restaurant and photos deleted successfully') {
                alert('음식점이 성공적으로 삭제되었습니다.');
                window.location.href = '/restaurant/main';
            } else {
                alert('음식점 삭제 중 오류가 발생했습니다.');
            }
        })
        .catch(error => console.error('Error:', error));
}

function submitReview() {
    const form = document.getElementById('reviewForm');
    const formData = new FormData(form);

    fetch('/restaurant/main/restaurant-review-regist?category=review', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === '리뷰 등록 성공') {
                alert('리뷰가 성공적으로 추가되었습니다.');
                const reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
                reviewModal.hide();
            } else {
                alert('리뷰 추가 중 오류가 발생했습니다.');
            }
        })
        .catch(error => console.error('Error:', error));
}
