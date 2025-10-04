import os
from datetime import datetime, timedelta
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

from jose import jwt, JWTError
from supabase import create_client

# Load environment variables from .env file
load_dotenv()

# --- Environment variables ---
SUPABASE_URL = os.getenv("SUPABASE_URL")                           
SUPABASE_KEY = os.getenv("SUPABASE_KEY")                                    
SECRET_KEY = os.getenv("SECRET_KEY", "change-me")                  
ALGORITHM = "HS256"       
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))  
SERVICE_ACCOUNT_PATH = os.getenv("SERVICE_ACCOUNT_PATH", "serviceAccountKey.json") 

# --- Initialize Supabase client ---
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Initialize Firebase Admin SDK ---
cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred)

# --- Initialize FastAPI app ---
app = FastAPI()
security = HTTPBearer()   # HTTP Bearer auth scheme for JWT validation

# --- Configure CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Change to the frontend domain when deploying.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic schema for incoming token request ---
class TokenRequest(BaseModel):
    token: str  # Firebase ID token from frontend client

# --- Helper: create JWT access token ---
def create_access_token(subject: str, expires_delta: Optional[timedelta] = None):
    """
    Generate a JWT token with subject (user ID) and expiration.
    """
    to_encode = {"sub": subject}
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- Google Authentication Endpoint ---
@app.post("/auth/google")
async def auth_google(payload: TokenRequest):
    """
    Authenticate a user via Firebase Google sign-in token.
    - Verify the Firebase ID token
    - Get user info (uid, email, name, picture)
    - Check if the user exists in Supabase, otherwise insert
    - Return a custom JWT access token for app usage
    """
    try:
        # Verify Firebase ID token
        decoded = firebase_auth.verify_id_token(payload.token)
        uid = decoded.get("uid")
        email = decoded.get("email")
        name = decoded.get("name")
        picture = decoded.get("picture")

        # Check if user exists in Supabase or insert a new one
        resp = supabase.table("users").select("*").eq("uid", uid).execute()
        users = resp.data if hasattr(resp, "data") else resp.get("data")

        if not users:
            supabase.table("users").insert({
                "uid": uid,
                "email": email,
                "name": name,
                "picture": picture
            }).execute()

        # Create JWT token for the client
        access_token = create_access_token(subject=uid)
        return {"access_token": access_token}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# --- JWT verification dependency ---
def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify the JWT token provided in the Authorization header.
    - Decode token using SECRET_KEY
    - Extract user ID (sub)
    - Raise 401 if invalid or missing
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uid = payload.get("sub")
        if uid is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return uid
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Protected route example ---
@app.get("/dashboard")
async def dashboard(uid: str = Depends(verify_jwt)):
    """
    Example of a protected route.
    - Requires a valid JWT
    - Fetch user data from Supabase using uid
    - Return the user record
    """
    resp = supabase.table("users").select("*").eq("uid", uid).execute()
    data = resp.data if hasattr(resp, "data") else resp.get("data")
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": data[0]}
