# backend/test_unit/test_auth.py
import pytest
from unittest.mock import patch
from datetime import timedelta
from jose import jwt

# Patch Firebase and Supabase before importing main
with patch("main.firebase_admin.initialize_app"), patch("main.credentials.Certificate"):
    import main
    from main import hash_password, verify_password, create_access_token, SECRET_KEY, ALGORITHM

def test_hash_and_verify_password():
    password = "mysecret123"
    hashed = hash_password(password)

    # Test password verification
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

    # Test JWT token creation
    token = create_access_token("user123", expires_delta=timedelta(minutes=5))
    decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert decoded["sub"] == "user123"
    assert "iat" in decoded
    assert "exp" in decoded
