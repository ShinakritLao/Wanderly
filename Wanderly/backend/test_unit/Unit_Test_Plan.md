# 🧪 Unit Test Plan — Backend Authentication

## **Overview**
This document outlines the unit test cases for verifying the **authentication logic** of the backend (FastAPI).  
The focus is on **password hashing, JWT token creation, and login validation**.

---

## **Test Environment**
- **Python Version:** 3.13  
- **Testing Framework:** pytest  
- **Test Folder:** `backend/test_unit/`  
- **Dependencies:** `passlib`, `python-jose`  

---

## **Test Cases**

---

### **UNIT-001: Password hashing and verification**
**Purpose:** Ensure passwords are securely hashed and can be verified correctly.  
**Preconditions:** None  

**Test Steps:**
1. Use `hash_password()` to hash a sample password.  
2. Verify that the hashed password is different from the plain password.  
3. Use `verify_password()` to validate the correct password.  
4. Attempt verification with an incorrect password.  

**Expected Result:**  
- Hashed password is not equal to the plain password.  
- `verify_password()` returns `True` for the correct password.  
- `verify_password()` returns `False` for an incorrect password.  

---


### **UNIT-002: Successful login**
**Purpose:** Ensure login succeeds for valid local users.  
**Preconditions:**  
- A mock local user exists in the test database.  

**Test Steps:**
1. Call the mocked `login_user()` function with valid email and password.  

**Expected Result:**  
- The returned user object matches the email used.  
- An `access_token` is generated.  

---

### **UNIT-003: Login fails for incorrect password**
**Purpose:** Ensure login fails with an invalid password.  
**Preconditions:**  
- A mock local user exists.  

**Test Steps:**
1. Call the mocked `login_user()` function with the correct email but wrong password.  

**Expected Result:**  
- A `ValueError` (or relevant exception) is raised with message `"Invalid password"`.  

---

### **UNIT-004: Login fails for non-existent user**
**Purpose:** Ensure login fails for an email not in the database.  
**Preconditions:** None  

**Test Steps:**
1. Call the mocked `login_user()` function with an unknown email.  

**Expected Result:**  
- A `ValueError` is raised with message `"User not found"`.  

---

### **UNIT-005: Login blocked for Google OAuth user**
**Purpose:** Ensure local login cannot be used for Google accounts.  
**Preconditions:**  
- A mock Google OAuth user exists.  

**Test Steps:**
1. Call the mocked `login_user()` function with a Google account email.  

**Expected Result:**  
- A `ValueError` is raised with message `"This account uses Google sign-in"`.  

---

## **Notes**
- These tests **do not require Firebase or Supabase**, using only mock users.  
- Test files are located in `backend/test_unit/`.  
- Use `pytest` to run the tests:  
```bash
cd backend/test_unit
pytest
