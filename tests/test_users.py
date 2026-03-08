def test_register_success(client):
    response = client.post(
        '/api/v1/users/register',
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "secret123",
            "full_name": "Test User",
        }
    )
    if response.status_code != 201:
        print(f"\nSTATUS: {response.status_code}")
        print(f"RESPONSE BODY: {response.json()}")
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert "id" in data
    assert "hashed_password" not in data

def test_register_existing_user(client):
    client.post(
        '/api/v1/users/register',
        json={
            "username": "existing",
            "email": "unique@example.ru",
            "password": "secret123"
        }
    )
    response = client.post(
        '/api/v1/users/register',
        json={
            "username": "existing",
            "email": "another@example.com",
            "password": "secret123"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Username or email already registered"

def test_register_existing_email(client):
    client.post(
        '/api/v1/users/register',
        json={
            "username": "unique",
            "email": "test@example.com",
            "password": "secret123"
        }
    )
    response = client.post(
        '/api/v1/users/register',
        json={
            "username": "another",
            "email": "test@example.com",
            "password": "secret123"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Username or email already registered"

def test_register_invalid_email(client):
    response = client.post(
        '/api/v1/users/register',
        json={
            "username": "user",
            "email": "not-an-email",
            "password": "secret123"
        }
    )
    assert response.status_code == 422

def test_get_profile_unauthorized(client):
    response = client.get('/api/v1/users/me')
    assert response.status_code == 401

def test_get_profile_authorized(client):
    client.post(
        '/api/v1/users/register',
        json={
            "username": "profileuser",
            "email": "profile@example.com",
            "password": "pass123"
        }
    )
    login_resp = client.post(
        '/api/v1/auth/token',
        data={'username': 'profileuser', 'password': 'pass123'},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    token = login_resp.json()['access_token']

    response = client.get(
        '/api/v1/users/me',
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "profileuser"
    assert data["email"] == "profile@example.com"
    assert "hashed_password" not in data