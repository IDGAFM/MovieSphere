const burger = document.querySelector('#burger');
const menu = document.querySelector('#b-menu');

burger.addEventListener('click', () => {
    menu.style.display = 'block'; 
    setTimeout(() => {
        menu.classList.toggle('show'); 
    }, 50); 
});

function closeMenu() {
    document.querySelector('.burger-slide').classList.remove('show');
}

// Открывает popup окно по его id
function openPopup(id) {
    var popup = document.getElementById(id);
    if (popup) {
        popup.style.opacity = 0; // Начальная прозрачность
        popup.style.transition = "opacity 0.3s ease, transform 0.3s ease"; // Используйте "=" вместо ":"
        popup.style.display = "block"; // Переместим отображение окна перед изменением прозрачности
        setTimeout(function() {
            popup.style.opacity = 1; // Установка прозрачности после отображения окна
        }, 10); // Задержка перед началом анимации
    }
}


// Закрывает popup окно по его id
function closePopup(id) {
    var popup = document.getElementById(id);
    if (popup) {
        popup.style.opacity = 0;
        popup.style.transition = "opacity 0.3s ease, transform 0.3s ease"; // Используйте "=" вместо ":"
        setTimeout(function() {
            popup.style.display = "none";
        }, 900); // Время, соответствующее transition времени в CSS
    }
}

// Добавляем обработчики событий для открытия popup окон при клике на соответствующие ссылки
document.getElementById('sign_in').addEventListener('click', function(event) {
    event.preventDefault(); // Предотвращаем стандартное действие перехода по ссылке
    openPopup('login-popup');
});

document.getElementById('sign_in_burger').addEventListener('click', function(event) {
    event.preventDefault(); // Предотвращаем стандартное действие перехода по ссылке
    openPopup('login-popup');
});

document.getElementById('sign_up').addEventListener('click', function(event) {
    event.preventDefault(); // Предотвращаем стандартное действие перехода по ссылке
    openPopup('register-popup');
});

document.getElementById('sign_up_burger').addEventListener('click', function(event) {
    event.preventDefault(); // Предотвращаем стандартное действие перехода по ссылке
    openPopup('register-popup');
});

// Добавляем обработчики событий для закрытия popup окон при нажатии на кнопку "Закрыть"
document.querySelectorAll('.close-tr').forEach(function(button) {
    button.addEventListener('click', function(event) {
        closePopup(event.target.closest('.popup').id);
    });
});

// Добавляем обработчики событий для закрытия popup окон при нажатии на клавишу "Escape"
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        var popups = document.querySelectorAll('.popup');
        popups.forEach(function(popup) {
            if (popup.style.display === "block") {
                closePopup(popup.id);
            }
        });
    }
});
