# backend/test_unit/test_login.py
import pytest
from datetime import timedelta
from main import verify_password, hash_password, create_access_token

# Mock user database
mock_users = [
    {
        "email": "shinshinakrit@gmail.com",
        "password": hash_password("12345678"),
        "uid": "user123",
        "login_type": "local"
    },
    {
        "email": "googleuser@gmail.com",
        "password": None,
        "uid": "google123",
        "login_type": "google"
    }
]

# Helper function simulating login_user
def login_user_mock(email, password):
    user = next((u for u in mock_users if u["email"] == email), None)
    if not user:
        raise ValueError("User not found")
    if user["login_type"] != "local":
        raise ValueError("This account uses Google sign-in")
    if not verify_password(password, user["password"]):
        raise ValueError("Invalid password")
    token = create_access_token(user["uid"], expires_delta=timedelta(minutes=5))
    return {"access_token": token, "user": user}


# ---------------- Test Cases ----------------

def test_login_success():
    resp = login_user_mock("shinshinakrit@gmail.com", "12345678")
    assert resp["user"]["email"] == "shinshinakrit@gmail.com"
    assert "access_token" in resp

def test_login_wrong_password():
    with pytest.raises(ValueError) as exc:
        login_user_mock("shinshinakrit@gmail.com", "wrongpass")
    assert str(exc.value) == "Invalid password"

def test_login_nonexistent_user():
    with pytest.raises(ValueError) as exc:
        login_user_mock("notfound@gmail.com", "12345678")
    assert str(exc.value) == "User not found"

def test_login_google_account():
    with pytest.raises(ValueError) as exc:
        login_user_mock("googleuser@gmail.com", "anything")
    assert str(exc.value) == "This account uses Google sign-in"
