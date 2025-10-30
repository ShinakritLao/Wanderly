# ADR-00X: Sprint #2 Kickoff and Authentication Setup

**Date:** October 3, 2025  
**Status:** Accepted  

## Context  
The project requires a secure and scalable authentication system that supports both mobile (React Native) and backend (FastAPI) environments. The system must handle user sign-in/sign-up, OTP verification, password recovery, Google login, and integration with external services such as Firebase and Supabase.

## Decision  
The team decided to use the following core technologies:
- **FastAPI** as the backend framework for handling authentication logic, API endpoints, and JWT-based token management.  
- **React Native (Expo)** for building a cross-platform mobile frontend (Android and iOS).  
- **Firebase Authentication** to simplify user identity management and support Google login.  
- **Supabase** for database storage and user profile synchronization.  
- **JWT (JSON Web Token)** for secure session management between client and server.  
- **CAPTCHA** for bot prevention before the sign-in/sign-up process.  
- **OTP and Email Services** for verifying users and handling password resets.  

## Rationale  
- FastAPI provides high performance and integrates well with Python-based async features.  
- React Native allows a single codebase for both mobile platforms.  
- Firebase and Supabase reduce backend complexity by providing managed authentication and database services.  
- JWT ensures stateless authentication and easy integration with mobile clients.  
- rCAPTCHA and OTP add layers of security against automated attacks and unauthorized access.  

## Consequences  
- Faster development due to the use of well-supported frameworks.  
- The system depends on third-party services (Firebase, Supabase) for reliability and uptime.  
- Developers must manage API keys and environment variables securely.  
- Some learning curve required for integrating multiple platforms together.  
