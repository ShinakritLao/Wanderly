# 🧪 End-to-End (E2E) Test Plan — Web Application

## **Overview**
This document outlines the end-to-end test cases for verifying the login and authentication flow of the web application (web version only).  
The focus is on the standard email and password login flow.

---

## **Test Environment**
- **Base URL:** `http://localhost:8081`  
- **Testing Framework:** Playwright  
- **Browser:** Chromium  
- **Account Used for Testing:**  
  - **Email:** `shinshinakrit@gmail.com`  
  - **Password:** `12345678`

---

## **Test Cases**

---

### **E2E-001: User logs in with valid credentials**
**Purpose:** Verify that users with valid credentials can log in successfully.  
**Preconditions:**  
- The app is running at `http://localhost:8081`.  
- A valid test account exists in the database.  

**Test Steps:**
1. Navigate to `http://localhost:8081`.  
2. Enter valid email and password.  
3. Click the **“Sign In”** button.   
4. Wait for redirect to `dashboard`.  

**Expected Result:**  
- User is redirected to the dashboard.  

---

### **E2E-002: User cannot log in with invalid password**
**Purpose:** Ensure incorrect passwords display an appropriate error message.  
**Preconditions:**  
- A valid account exists (`shinshinakrit@gmail.com`).  

**Test Steps:**
1. Navigate to `http://localhost:8081`.  
2. Enter `shinshinakrit@gmail.com` with an incorrect password.  
3. Click **“Sign In”**.  



**Expected Result:**  
- The page shows an error message such as *“No account found with this email or incorrect password.”*  
- The user is not redirected to the dashboard.  

---

### **E2E-003: User cannot log in with empty fields**
**Purpose:** Validate client-side form handling for empty input fields.  
**Preconditions:** None  

**Test Steps:**
1. Navigate to `http://localhost:8081`.  
2. Leave both fields blank. 
3. Click **“Sign In”**.  


**Expected Result:**  
- The app displays validation messages like *“Please fill in both email and password.”*  
- Login is not attempted.  

---

### **E2E-004: User can log out successfully**
**Purpose:** Verify that a logged-in user can log out properly.  
**Preconditions:**  
- The user is logged in and on the dashboard.  

**Test Steps:**
1. Navigate to `http://localhost:8081`.  
2. Enter valid email and password.  
3. Click the **“Sign In”** button.   
4. Wait for redirect to `dashboard`.  
5. Click the **“Logout”** button.  
6. Wait for redirect to the login or home page.  

**Expected Result:**  
- The user is redirected to the homepage or login screen.  
- Dashboard is no longer accessible without re-login.  

---

### **E2E-005: Logged-out user cannot access dashboard directly**
**Purpose:** Ensure authentication guards prevent access to restricted routes.  
**Preconditions:**  
- User is logged out.  

**Test Steps:**
1. Navigate directly to `http://localhost:8081/dashboard`.  

**Expected Result:**  
- The user is redirected to the login page.  
- Dashboard content is not visible.  

---

## **Notes**
- Screenshots will be automatically captured for each successful test and stored in the `test-results/` folder.  
- Future tests (e.g., Google OAuth and mobile app version) will be added later after initial flow stabilization.  
