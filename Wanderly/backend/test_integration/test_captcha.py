# test_integration/test_captcha.py

import sys
from unittest.mock import MagicMock
from typing import Dict

# --- Mock Supabase BEFORE any imports ---
sys.modules['supabase'] = MagicMock()
sys.modules['firebase_admin'] = MagicMock()

import pytest
import main
from main import app, slider_captcha_storage
from httpx import AsyncClient
from datetime import datetime, timedelta


# --- Pytest Fixture ---
@pytest.fixture(autouse=True)
def setup_mocks():
    # Clear captcha storage before each test
    slider_captcha_storage.clear()
    yield


# --- Tests ---

@pytest.mark.asyncio
async def test_slider_captcha_full_flow():
    """Test complete slider CAPTCHA generation and verification"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Generate CAPTCHA
        response_gen = await ac.get("/captcha/slider/generate")
        assert response_gen.status_code == 200
        
        captcha_data = response_gen.json()
        token = captcha_data["token"]
        solution_x = captcha_data["cutout_x"]
        
        assert token is not None
        assert "puzzle_url" in captcha_data
        assert 30 <= solution_x <= 250
        
        # Verify with correct position (within tolerance)
        response_verify = await ac.post("/captcha/slider/verify", json={
            "token": token,
            "position": solution_x + 2,  # Within default tolerance of 5
            "tolerance": 5
        })
        assert response_verify.status_code == 200
        assert response_verify.json()["message"] == "Slider CAPTCHA verified successfully"
        
        # Token should be consumed
        assert token not in slider_captcha_storage


@pytest.mark.asyncio
async def test_slider_captcha_wrong_position():
    """Test CAPTCHA fails with incorrect position"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Generate CAPTCHA
        response_gen = await ac.get("/captcha/slider/generate")
        captcha_data = response_gen.json()
        token = captcha_data["token"]
        solution_x = captcha_data["cutout_x"]
        
        # Verify with wrong position (outside tolerance)
        response_verify = await ac.post("/captcha/slider/verify", json={
            "token": token,
            "position": solution_x + 20,  # Way off
            "tolerance": 5
        })
        assert response_verify.status_code == 400
        assert response_verify.json()["detail"] == "Incorrect slider position"


@pytest.mark.asyncio
async def test_slider_captcha_invalid_token():
    """Test CAPTCHA fails with invalid token"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response_verify = await ac.post("/captcha/slider/verify", json={
            "token": "fake_token_123",
            "position": 100,
            "tolerance": 5
        })
        assert response_verify.status_code == 400
        assert response_verify.json()["detail"] == "Invalid CAPTCHA token"


@pytest.mark.asyncio
async def test_slider_captcha_expiration():
    """Test CAPTCHA fails after expiration"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Generate CAPTCHA
        response_gen = await ac.get("/captcha/slider/generate")
        captcha_data = response_gen.json()
        token = captcha_data["token"]
        solution_x = captcha_data["cutout_x"]
        
        # Manually expire the token
        slider_captcha_storage[token]["expires_at"] = datetime.utcnow() - timedelta(minutes=1)
        
        # Try to verify expired token
        response_verify = await ac.post("/captcha/slider/verify", json={
            "token": token,
            "position": solution_x,
            "tolerance": 5
        })
        assert response_verify.status_code == 400
        assert response_verify.json()["detail"] == "CAPTCHA expired"
        
        # Token should be removed from storage
        assert token not in slider_captcha_storage


@pytest.mark.asyncio
async def test_slider_captcha_token_consumed():
    """Test CAPTCHA token can only be used once"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Generate CAPTCHA
        response_gen = await ac.get("/captcha/slider/generate")
        captcha_data = response_gen.json()
        token = captcha_data["token"]
        solution_x = captcha_data["cutout_x"]
        
        # First verification - should succeed
        response_verify1 = await ac.post("/captcha/slider/verify", json={
            "token": token,
            "position": solution_x,
            "tolerance": 5
        })
        assert response_verify1.status_code == 200
        
        # Second verification with same token - should fail
        response_verify2 = await ac.post("/captcha/slider/verify", json={
            "token": token,
            "position": solution_x,
            "tolerance": 5
        })
        assert response_verify2.status_code == 400
        assert response_verify2.json()["detail"] == "Invalid CAPTCHA token"