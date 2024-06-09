document.addEventListener('DOMContentLoaded', function () {
    var leftMenu = document.querySelector('.left-menu');
    var rightMenu = document.querySelector('.right-menu');
    var leftToggleBtn = document.getElementById('left-toggle-btn');
    var rightToggleBtn = document.getElementById('right-toggle-btn');
    var menuBToggle = document.getElementById('menuB-toggle');
    var menuBFlyout = document.getElementById('menuB-flyout');

    leftToggleBtn.addEventListener('click', function () {
        leftMenu.classList.toggle('collapsed');
    });

    rightToggleBtn.addEventListener('click', function () {
        rightMenu.classList.toggle('collapsed');
    });

    menuBToggle.addEventListener('click', function (e) {
        e.preventDefault();
        if (menuBFlyout.classList.contains('show')) {
            menuBFlyout.classList.remove('show');
            setTimeout(function() {
                menuBFlyout.style.display = 'none';
            }, 500); // CSS 애니메이션 시간과 동일하게 설정
        } else {
            menuBFlyout.style.display = 'block';
            setTimeout(function() {
                menuBFlyout.classList.add('show');
            }, 10); // 약간의 지연을 주어 display 변경 후 애니메이션이 적용
        }
    });
});
