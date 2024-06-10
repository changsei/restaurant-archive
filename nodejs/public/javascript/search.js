function searchRestaurants() {
    const form = document.getElementById('searchForm');
    const formData = new FormData(form);

    fetch('/restaurant/search', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('searchResults');
            resultsContainer.innerHTML = '<div class="list-group">'; // 초기화와 리스트 그룹 시작

            data.forEach(restaurant => {
                resultsContainer.innerHTML += `
                <a href="#" class="list-group-item list-group-item-action flex-column align-items-start btn-toggle">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${restaurant.restaurant_name}</h5>
                        <small>별점: ${restaurant.average_rating || '평점 없음'}</small>
                    </div>
                    <p class="mb-1">도시: ${restaurant.restaurant_city}</p>
                    <small class="text-muted">더 보기...</small>
                </a>
            `;
            });

            resultsContainer.innerHTML += '</div>';
        })
        .catch(error => console.error('Error:', error));
}
