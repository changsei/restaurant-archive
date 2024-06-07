document.addEventListener('DOMContentLoaded', function () {
    var leftMenu = document.querySelector('.left-menu');
    var rightMenu = document.querySelector('.right-menu');
    var leftToggleBtn = document.getElementById('left-toggle-btn');
    var rightToggleBtn = document.getElementById('right-toggle-btn');

    leftToggleBtn.addEventListener('click', function () {
        leftMenu.classList.toggle('collapsed');
    });

    rightToggleBtn.addEventListener('click', function () {
        rightMenu.classList.toggle('collapsed');
    });
});
