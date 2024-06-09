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
        resultsContainer.innerHTML = '';
        data.forEach(restaurant => {
            resultsContainer.innerHTML += `
                <div>
                    <h3>${restaurant.restaurant_name}</h3>
                    <p>Rating: ${restaurant.average_rating}</p>
                    <!-- Other restaurant details -->
                </div>
            `;
        });
    })
    .catch(error => console.error('Error:', error));
}
