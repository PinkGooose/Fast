// Базовый URL API (все запросы к бэкенду)
const API_BASE = '/api/v1';

// Состояние авторизации
let isAuthenticated = false;

// Функция для обновления навигации (показываем ссылки в зависимости от наличия токена)
function updateNavigation() {
    const token = localStorage.getItem('access_token');
    const profileLink = document.getElementById('profile-link');
    const logoutLink = document.getElementById('logout-link');
    const tasksLink = document.getElementById('tasks-link'); // добавили
    const registerLink = document.querySelector('a[href="/register"]');
    const loginLink = document.querySelector('a[href="/login"]');

    if (token) {
        if (profileLink) profileLink.style.display = 'inline-block';
        if (logoutLink) logoutLink.style.display = 'inline-block';
        if (tasksLink) tasksLink.style.display = 'inline-block'; // показываем
        if (registerLink) registerLink.style.display = 'none';
        if (loginLink) loginLink.style.display = 'none';
    } else {
        if (profileLink) profileLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
        if (tasksLink) tasksLink.style.display = 'none'; // скрываем
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
if (window.location.pathname === '/login') {
    console.log('Login page loaded'); // для отладки
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // ОЧЕНЬ ВАЖНО – отменяет стандартную отправку
            const formData = new FormData(loginForm);
            const username = formData.get('username');
            const password = formData.get('password');

            try {
                const response = await fetch('/api/v1/auth/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ username, password })
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('access_token', result.access_token);
                    showMessage('Вход выполнен!', 'green');
                    setTimeout(() => { window.location.href = '/profile'; }, 1000);
                } else {
                    showMessage(result.detail || 'Ошибка входа', 'red');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                showMessage('Ошибка соединения', 'red');
            }
        });
    }
}

// ------------------- Страница профиля (/profile) -------------------
if (window.location.pathname === '/profile') {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '/login';
    } else {
        // Загружаем данные профиля
        fetch('/api/v1/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Не удалось загрузить профиль');
            }
            return response.json();
        })
        .then(data => {
            const profileDiv = document.getElementById('profile-info');
            if (profileDiv) {
                profileDiv.innerHTML = `
                    <p><strong>ID:</strong> ${data.id}</p>
                    <p><strong>Имя пользователя:</strong> ${data.username}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Полное имя:</strong> ${data.full_name || 'не указано'}</p>
                `;
            }
        })
        .catch(error => {
            console.error(error);
            const msgDiv = document.getElementById('message');
            if (msgDiv) {
                msgDiv.textContent = 'Ошибка загрузки профиля';
                msgDiv.style.color = 'red';
            }
            // Если токен недействителен, удаляем его и перенаправляем на логин
            localStorage.removeItem('access_token');
            setTimeout(() => { window.location.href = '/login'; }, 2000);
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
// ------------------- Общие функции -------------------
function getCurrentFilters() {
    const status = document.getElementById('filter-status')?.value;
    const category = document.getElementById('filter-category')?.value;
    return { status, category };
}

function showMessage(text, color = 'green') {
    const msgDiv = document.getElementById('message');
    if (msgDiv) {
        msgDiv.style.color = color;
        msgDiv.textContent = text;
        setTimeout(() => { msgDiv.textContent = ''; }, 3000);
    }
}

// ------------------- Страница списка задач (/tasks) -------------------
if (window.location.pathname === '/tasks') {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '/login';
    } else {
        loadTasks(); // загружаем задачи

        document.getElementById('apply-filters')?.addEventListener('click', () => {
            loadTasks(getCurrentFilters());
        });

        // Делегирование событий для кнопок в списке
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-status')) {
                const taskId = e.target.dataset.id;
                const newStatus = e.target.dataset.status;
                updateTaskStatus(taskId, newStatus);
            } else if (e.target.classList.contains('btn-delete')) {
                const taskId = e.target.dataset.id;
                deleteTask(taskId);
            } else if (e.target.classList.contains('btn-edit')) {
                const taskId = e.target.dataset.id;
                window.location.href = `/edit-task?id=${taskId}`;
            }
        });
    }
}

// ------------------- Страница создания задачи (/create-task) -------------------
if (window.location.pathname === '/create-task') {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '/login';
    } else {
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(taskForm);
                const taskData = {
                    title: formData.get('title'),
                    description: formData.get('description') || null,
                    category: formData.get('category')
                };

                try {
                    const response = await fetch('/api/v1/tasks/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(taskData)
                    });

                    if (response.ok) {
                        showMessage('Задача создана!', 'green');
                        setTimeout(() => {
                            window.location.href = '/tasks'; // перенаправление на список
                        }, 1000);
                    } else {
                        const err = await response.json();
                        showMessage(err.detail || 'Ошибка создания', 'red');
                    }
                } catch (error) {
                    console.error('Ошибка:', error);
                }
            });
        }
    }
}

// ------------------- Функции работы с задачами (остаются без изменений) -------------------
async function loadTasks(filters = {}) {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    let url = '/api/v1/tasks/?';
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    url += params.toString();

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const tasks = await response.json();
            renderTasks(tasks);
        } else {
            showMessage('Ошибка загрузки задач', 'red');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

function renderTasks(tasks) {
    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;

    if (tasks.length === 0) {
        tasksList.innerHTML = '<p>У вас пока нет задач. Создайте первую!</p>';
        return;
    }

    let html = '';
    tasks.forEach(task => {
        const statusText = {
            'pending': 'Ожидает',
            'in_progress': 'В процессе',
            'completed': 'Завершено'
        }[task.status] || task.status;

        const categoryText = {
            'day': 'День',
            'week': 'Неделя',
            'month': 'Месяц',
            'year': 'Год'
        }[task.category] || task.category;

        html += `
            <div class="task-card" data-id="${task.id}">
                <div class="task-header">
                    <h3>${task.title}</h3>
                    <span class="task-status status-${task.status}">${statusText}</span>
                </div>
                <p class="task-description">${task.description || ''}</p>
                <div class="task-meta">
                    <span>Категория: ${categoryText}</span>
                </div>
                <div class="task-actions">
                    <button class="btn-status" data-id="${task.id}" data-status="in_progress">В процесс</button>
                    <button class="btn-status" data-id="${task.id}" data-status="completed">Завершить</button>
                    <button class="btn-edit" data-id="${task.id}">Редактировать</button>
                    <button class="btn-delete" data-id="${task.id}">Удалить</button>
                </div>
            </div>
        `;
    });
    tasksList.innerHTML = html;
}

async function updateTaskStatus(taskId, newStatus) {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
        const response = await fetch(`/api/v1/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            showMessage('Статус обновлён', 'green');
            loadTasks(getCurrentFilters());
        } else {
            const err = await response.json();
            showMessage(err.detail || 'Ошибка обновления', 'red');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function deleteTask(taskId) {
    if (!confirm('Удалить задачу?')) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
        const response = await fetch(`/api/v1/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 204) {
            showMessage('Задача удалена', 'green');
            loadTasks(getCurrentFilters());
        } else {
            const err = await response.json();
            showMessage(err.detail || 'Ошибка удаления', 'red');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}
// ------------------- Страница редактирования задачи (/edit-task) -------------------
if (window.location.pathname === '/edit-task') {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '/login';
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        const taskId = urlParams.get('id');
        if (!taskId) {
            showMessage('ID задачи не указан', 'red');
        }

        // Загружаем данные задачи
        fetch(`/api/v1/tasks/${taskId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (!response.ok) throw new Error('Ошибка загрузки задачи');
            return response.json();
        })
        .then(task => {
            document.getElementById('task-id').value = task.id;
            document.getElementById('title').value = task.title;
            document.getElementById('description').value = task.description || '';
            document.getElementById('category').value = task.category;
            document.getElementById('status').value = task.status;
        })
        .catch(error => {
            console.error(error);
            showMessage('Не удалось загрузить задачу', 'red');
        });

        // Обработка отправки формы
        document.getElementById('edit-task-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedTask = {
                title: formData.get('title'),
                description: formData.get('description') || null,
                category: formData.get('category'),
                status: formData.get('status')
            };

            try {
                const response = await fetch(`/api/v1/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedTask)
                });

                if (response.ok) {
                    showMessage('Задача обновлена!', 'green');
                    setTimeout(() => { window.location.href = '/tasks'; }, 1000);
                } else {
                    const err = await response.json();
                    showMessage(err.detail || 'Ошибка обновления', 'red');
                }
            } catch (error) {
                console.error('Ошибка:', error);
            }
        });
    }
}