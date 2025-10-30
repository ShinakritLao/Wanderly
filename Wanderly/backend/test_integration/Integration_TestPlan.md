# 🧪 Integration Test Plan — Slider CAPTCHA API

## Overview
This document outlines the integration test cases for verifying the **Slider CAPTCHA** endpoints and their complete flow.  
The focus is on testing **CAPTCHA generation, verification, expiration, and security measures**.

---

## Test Environment

| Setting | Description |
|----------|--------------|
| **Base URL** | `http://test` (via `AsyncClient`) |
| **Testing Framework** | Pytest + httpx |
| **Python Version** | 3.13.2 |
| **Test File** | `test_integration/test_captcha.py` |

### Mocking Strategy
- **Supabase** mocked to prevent database calls  
- **Firebase Admin SDK** mocked  
- **CAPTCHA** uses in-memory storage (`slider_captcha_storage`)

---

## Test Cases

### INT-CAPTCHA-001: Generate and verify slider CAPTCHA with correct position
**Purpose:**  
Verify the complete happy path of CAPTCHA generation and successful verification.

**Preconditions:**  
- CAPTCHA storage is empty.

**Test Steps:**
1. GET `/captcha/slider/generate`
2. Extract `token` and `cutout_x` (solution position)
3. POST `/captcha/slider/verify` with:
   - `token`: received token  
   - `position`: solution + 2 (within tolerance of 5)  
   - `tolerance`: 5  

**Expected Result:**
- HTTP 200 response from generation endpoint.  
- Response includes `token`, `puzzle_url`, `cutout_x` (30–250), `slider_width`, and `expires_at`.  
- HTTP 200 response from verification endpoint.  
- Message: `"Slider CAPTCHA verified successfully"`.  
- Token is removed from storage after successful verification.

---

### INT-CAPTCHA-002: CAPTCHA fails with incorrect slider position
**Purpose:**  
Ensure CAPTCHA rejects positions outside the acceptable tolerance range.

**Preconditions:**  
- CAPTCHA storage is empty.

**Test Steps:**
1. GET `/captcha/slider/generate`
2. Extract `token` and `cutout_x` from response.
3. POST `/captcha/slider/verify` with:
   - `token`: received token  
   - `position`: solution + 20 (outside tolerance)  
   - `tolerance`: 5  

**Expected Result:**
- HTTP 400 response.  
- Error message: `"Incorrect slider position"`.  
- Token remains in storage (not consumed).

---

### INT-CAPTCHA-003: CAPTCHA fails with invalid/non-existent token
**Purpose:**  
Verify that the system rejects verification attempts with fake or non-existent tokens.

**Preconditions:**  
- No CAPTCHA has been generated.

**Test Steps:**
1. POST `/captcha/slider/verify` with:
   - `token`: `"fake_token_123"`  
   - `position`: 100  
   - `tolerance`: 5  

**Expected Result:**
- HTTP 400 response.  
- Error message: `"Invalid CAPTCHA token"`.

---

### INT-CAPTCHA-004: CAPTCHA fails after expiration
**Purpose:**  
Ensure expired CAPTCHA tokens are properly rejected and cleaned up.

**Preconditions:**  
- CAPTCHA storage is empty.

**Test Steps:**
1. GET `/captcha/slider/generate`
2. Extract `token` and `cutout_x` from response.
3. Manually set the token’s `expires_at` to 1 minute in the past.
4. POST `/captcha/slider/verify` with:
   - `token`: received token  
   - `position`: exact solution position  
   - `tolerance`: 5  

**Expected Result:**
- HTTP 400 response.  
- Error message: `"CAPTCHA expired"`.  
- Token is removed from storage after expiration check.

---

### INT-CAPTCHA-005: CAPTCHA token can only be used once (single-use)
**Purpose:**  
Verify that CAPTCHA tokens are consumed after successful verification and cannot be reused.

**Preconditions:**  
- CAPTCHA storage is empty.

**Test Steps:**
1. GET `/captcha/slider/generate`
2. Extract `token` and `cutout_x` from response.
3. POST `/captcha/slider/verify` with correct position (first attempt).
4. POST `/captcha/slider/verify` with same token and correct position (second attempt).

**Expected Result:**
- First verification: HTTP 200 response with success message.  
- Second verification: HTTP 400 response with error message `"Invalid CAPTCHA token"`.  
- Token is removed from storage after first successful verification.

---

## Notes
- All tests use **mocked external dependencies** (Supabase, Firebase) to ensure isolation.  
- CAPTCHA storage is automatically cleared before each test using `autouse=True` fixture.  
- Tests validate both **functionality and security** (expiration, single-use, tolerance).  
- Future enhancements may include testing **custom tolerance values** and **rate limiting**.
