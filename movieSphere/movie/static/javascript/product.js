const rating = document.querySelector('form[name=rating]');

rating.addEventListener("change", function (e) {
    e.preventDefault();
    let data = new FormData(this);
    fetch(`${this.action}`, {
        method: 'POST',
        body: data
    })
    .then(response => {
        if (response.ok) {
            alert("Рейтинг установлен");
            location.reload(); // Перезагрузка страницы для обновления рейтинга
            updateAverageRating();

        } else {
            alert("Ошибка");
        }
    })
    .catch(error => alert("Ошибка"));
});

function updateAverageRating(movieId) {
    // Создаем URL для получения актуальных данных о фильме
    const url = `/api/movie/${movieId}/average_rating/`;

    // Отправляем запрос на сервер для получения данных о среднем рейтинге фильма
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при получении данных');
            }
            return response.json();
        })
        .then(data => {
            // Обновляем средний рейтинг на странице
            const movieElement = document.getElementById(`movie-${movieId}`);
            if (movieElement) {
                const averageRatingElement = movieElement.querySelector('.rating-num');
                if (averageRatingElement) {
                    averageRatingElement.textContent = data.average_rating;
                }
            }
        })
        .catch(error => {
            console.error('Произошла ошибка:', error);
        });
}


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
        }, 500); // Время, соответствующее transition времени в CSS
    }
}




// Добавление обработчиков событий для открытия popup окон
document.getElementById('sign_in').addEventListener('click', function(event) {
    event.preventDefault();
    openPopup('login-popup');
});

document.getElementById('sign_in_burger').addEventListener('click', function(event) {
    event.preventDefault();
    openPopup('login-popup');
});

document.getElementById('sign_up').addEventListener('click', function(event) {
    event.preventDefault();
    openPopup('register-popup');
});

document.getElementById('sign_up_burger').addEventListener('click', function(event) {
    event.preventDefault();
    openPopup('register-popup');
});

// Добавление обработчиков событий для закрытия popup окон
document.querySelectorAll('.close').forEach(function(button) {
    button.addEventListener('click', function(event) {
        closePopup(event.target.closest('.popup').id);
    });
});

document.querySelectorAll('.popup-content button[type="submit"]').forEach(function(button) {
    button.addEventListener('click', function(event) {
        closePopup(event.target.closest('.popup').id);
    });
});

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

window.addEventListener("click", function(event) {
    var popupClicked = event.target.closest(".popup");
    if (!popupClicked && openPopupId !== "") {
        closePopup(openPopupId);
    }
});
