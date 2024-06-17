function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

document.getElementById('edit-profile').addEventListener('click', function() {
    document.getElementById('edit-profile-popup').style.display = 'block';
});

document.querySelector('.close-popup').addEventListener('click', function() {
    document.getElementById('edit-profile-popup').style.display = 'none';
});




document.getElementById('popup-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    fetch(form.action, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
        },
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('edit-profile-popup').style.display = 'none';
            alert('Данные успешно обновлены');
            location.reload();
        } else {
            console.error('Form errors:', data.errors);
            alert('Ошибка при обновлении данных');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ошибка при обновлении данных');
    });
});

document.getElementById('image-upload-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    fetch(form.action, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
        },
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            console.error('Form errors:', data.errors);
            alert('Ошибка при обновлении фото');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ошибка при обновлении фото');
    });
});

document.getElementById('photo').addEventListener('change', function() {
    document.getElementById('image-upload-form').submit();
});

document.getElementById('save-image').addEventListener('click', function() {
    const imageOptionsModal = document.getElementById('image-options-modal');
    const formPhotoValue = document.querySelector('.prof-img');
    if (formPhotoValue) {
        imageOptionsModal.classList.remove('hide');
        setTimeout(() => {
            imageOptionsModal.classList.add('show');
        }, 10); // Small delay to allow state change to register
    } else {
        document.getElementById('photo').click();
    }
});

document.querySelector('.close-popup-modal').addEventListener('click', function() {
    const imageOptionsModal = document.getElementById('image-options-modal');
    imageOptionsModal.classList.remove('show');
    setTimeout(() => {
        imageOptionsModal.classList.add('hide');
    }, 300); // Timeout should match the transition duration
});




document.getElementById('change-photo').addEventListener('click', function() {
    document.getElementById('photo').click();
    document.getElementById('image-options-modal').classList.remove('show');
});

document.getElementById('remove-photo').addEventListener('click', function() {
    fetch(profilePhotoRemoveUrl, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            console.error('Form errors:', data.errors);
            alert('Ошибка при удалении фото');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ошибка при удалении фото');
    });
});

