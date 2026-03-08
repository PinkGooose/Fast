def test_login_success(client):
    client.post(
        '/api/v1/users/register',
        json={
            "username": "loginuser",
            "email": "login@example.com",
            "password": "correctpass"
        }
    )

    response = client.post(
        '/api/v1/auth/token',
        data={
            "username": "loginuser",
            "password": "correctpass"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client):
    client.post(
        '/api/v1/users/register',
        json={
            "username": "user",
            "email": "login@example.com",
            "password": "correctpass"
        }
    )

    response = client.post(
        '/api/v1/auth/token',
        data={
            "username": "user",
            "password": "wrongpass"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

def test_login_nonexistent_user(client):
    response = client.post(
        '/api/v1/auth/token',
        data={
            "username": "ghost",
            "password": "anypass"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"