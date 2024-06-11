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
        resultsContainer.innerHTML = ''; // 초기화

        data.forEach(restaurant => {
            const restaurantElement = document.createElement('div');
            restaurantElement.className = 'list-group-item flex-column align-items-start btn-toggle';
            restaurantElement.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${restaurant.restaurant_name}</h5>
                    <small>별점: ${restaurant.average_rating || '평점 없음'}</small>
                </div>
                <p class="mb-1">도시: ${restaurant.restaurant_city}</p>
                <button class="btn btn-link" onclick="viewRestaurant(${restaurant.restaurant_id})">자세히 보기</button>
            `;
            resultsContainer.appendChild(restaurantElement);
        });
    })
    .catch(error => console.error('Error:', error));
}

function viewRestaurant(restaurantId) {
    const form = new FormData();
    form.append('restaurantId', restaurantId);

    fetch('/restaurant/main/restaurant-information', {
        method: 'POST',
        body: form
    })
    .then(response => response.text())
    .then(html => {
        document.open();
        document.write(html);
        document.close();
    })
    .catch(error => console.error('Error:', error));
}