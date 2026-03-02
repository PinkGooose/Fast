// Базовый URL API (все запросы к бэкенду)
const API_BASE = '/api/v1';

// Состояние авторизации
let isAuthenticated = false;

// Функция для обновления навигации (показываем ссылки в зависимости от наличия токена)
function updateNavigation() {
    const token = localStorage.getItem('access_token');
    const profileLink = document.getElementById('profile-link');
    const logoutLink = document.getElementById('logout-link');
    const registerLink = document.querySelector('a[href="/register.html"]');
    const loginLink = document.querySelector('a[href="/login.html"]');

    if (token) {
        isAuthenticated = true;
        if (profileLink) profileLink.style.display = 'inline-block';
        if (logoutLink) logoutLink.style.display = 'inline-block';
        if (registerLink) registerLink.style.display = 'none';
        if (loginLink) loginLink.style.display = 'none';
    } else {
        isAuthenticated = false;
        if (profileLink) profileLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'inline-block';
        if (loginLink) loginLink.style.display = 'inline-block';
    }
}

// Обработка формы регистрации
if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            full_name: formData.get('full_name') || null
        };

        try {
            const response = await fetch(`${API_BASE}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            const messageDiv = document.getElementById('message');

            if (response.ok) {
                messageDiv.style.color = 'green';
                messageDiv.textContent = 'Регистрация успешна! Теперь вы можете войти.';
                e.target.reset();
            } else {
                messageDiv.style.color = 'red';
                messageDiv.textContent = result.detail || 'Ошибка регистрации';
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    });
}

// Обработка формы входа
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        // Для OAuth2 Password Flow нужно отправлять данные в формате application/x-www-form-urlencoded
        const params = new URLSearchParams();
        params.append('username', formData.get('username'));
        params.append('password', formData.get('password'));

        try {
            const response = await fetch(`${API_BASE}/auth/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });

            const result = await response.json();
            const messageDiv = document.getElementById('message');

            if (response.ok) {
                localStorage.setItem('access_token', result.access_token);
                messageDiv.style.color = 'green';
                messageDiv.textContent = 'Вход выполнен! Перенаправление...';
                setTimeout(() => {
                    window.location.href = '/static/profile.html';
                }, 1500);
            } else {
                messageDiv.style.color = 'red';
                messageDiv.textContent = result.detail || 'Ошибка входа';
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    });
}

// Загрузка данных профиля (если мы на странице profile.html)
if (window.location.pathname === '/profile.html' || window.location.pathname.endsWith('/profile.html')) {
    const token = localStorage.getItem('access_token');
    if (!token) {
        // Если нет токена, редирект на логин
        window.location.href = '/login.html';
    } else {
        fetch(`${API_BASE}/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Не удалось загрузить профиль');
            }
            return response.json();
        })
        .then(data => {
            const profileDiv = document.getElementById('profile-info');
            profileDiv.innerHTML = `
                <p><strong>ID:</strong> ${data.id}</p>
                <p><strong>Имя пользователя:</strong> ${data.username}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Полное имя:</strong> ${data.full_name || 'не указано'}</p>
            `;
        })
        .catch(error => {
            console.error(error);
            document.getElementById('message').textContent = 'Ошибка загрузки профиля';
            // Если токен недействителен, удаляем его и редиректим
            localStorage.removeItem('access_token');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        });
    }
}

// Обработка выхода (клик по ссылке "Выход")
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'logout-link') {
        e.preventDefault();
        localStorage.removeItem('access_token');
        updateNavigation();
        window.location.href = '/';
    }
});

// Вызываем обновление навигации при загрузке каждой страницы
updateNavigation();