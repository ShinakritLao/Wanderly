import os
import uuid
import random
from datetime import datetime, timedelta
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from jose import jwt, JWTError
from supabase import create_client

# --- Load environment variables ---
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
SERVICE_ACCOUNT_PATH = os.getenv("SERVICE_ACCOUNT_PATH", "serviceAccountKey.json")

# --- Initialize Supabase ---
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Initialize Firebase Admin SDK ---
cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred)

# --- Password Hashing Setup ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Initialize FastAPI ---
app = FastAPI()
security = HTTPBearer()

# --- Configure CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # เปลี่ยนเป็น domain frontend จริงตอน deploy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- OTP storage (in-memory for demo) ---
otp_store = {}  # { email: { otp: "123456", expires: datetime } }

# --- Pydantic Schemas ---
class TokenRequest(BaseModel):
    id_token: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    newPassword: str

class RequestOtpBody(BaseModel):
    email: EmailStr

class VerifyOtpBody(BaseModel):
    email: EmailStr
    otp: str
    newPassword: str

# --- Helper Functions ---
def get_supabase_data(resp):
    if hasattr(resp, "data") and resp.data is not None:
        return resp.data
    elif isinstance(resp, dict) and "data" in resp:
        return resp["data"]
    return []

def create_access_token(subject: str, expires_delta: Optional[timedelta] = None):
    now = datetime.utcnow()
    expire = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {"sub": subject, "iat": now, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def hash_password(password: str):
    safe_password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(safe_password)

def verify_password(plain_password, hashed_password):
    safe_password = plain_password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.verify(safe_password, hashed_password)

# Fake email sender for demo
def send_email(email: str, otp: str):
    print(f"[Email sent to {email}]: OTP = {otp}")  # ใช้จริงต้อง integrate กับ SMTP / SendGrid

# ===================================================== #
#                   GOOGLE LOGIN                        #
# ===================================================== #
@app.post("/auth/google")
async def auth_google(payload: TokenRequest):
    try:
        decoded = firebase_auth.verify_id_token(payload.id_token)
        uid = decoded.get("uid")
        email = decoded.get("email")
        name = decoded.get("name")
        picture = decoded.get("picture")

        resp = supabase.table("users").select("*").eq("uid", uid).execute()
        users = get_supabase_data(resp)

        if not users:
            supabase.table("users").insert({
                "uid": uid,
                "email": email,
                "name": name,
                "picture": picture,
                "login_type": "google"
            }).execute()

        token = create_access_token(subject=uid)
        return {"access_token": token, "login_type": "google"}

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

# ===================================================== #
#             EMAIL + PASSWORD LOGIN SYSTEM             #
# ===================================================== #
@app.post("/auth/register")
async def register_user(req: RegisterRequest):
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    resp = supabase.table("users").select("*").eq("email", req.email).execute()
    existing = get_supabase_data(resp)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(req.password)
    user = {
        "email": req.email,
        "password": hashed_pw,
        "name": req.name or req.email.split("@")[0],
        "uid": f"local_{uuid.uuid4().hex}",
        "picture": None,
        "login_type": "local"
    }

    supabase.table("users").insert(user).execute()
    token = create_access_token(subject=user["uid"])
    return {"access_token": token, "user": user}

@app.post("/auth/login")
async def login_user(req: LoginRequest):
    resp = supabase.table("users").select("*").eq("email", req.email).execute()
    users = get_supabase_data(resp)
    if not users:
        raise HTTPException(status_code=404, detail="User not found")

    user = users[0]
    if user.get("login_type") != "local":
        raise HTTPException(status_code=400, detail="This account uses Google sign-in")

    if not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid password")

    token = create_access_token(subject=user["uid"])
    return {"access_token": token, "user": user}

# ===================================================== #
#             JWT VERIFY + PROTECTED ROUTE              #
# ===================================================== #
def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uid = payload.get("sub")
        if uid is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return uid
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/dashboard")
async def dashboard(uid: str = Depends(verify_jwt)):
    resp = supabase.table("users").select("*").eq("uid", uid).execute()
    data = get_supabase_data(resp)
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": data[0]}

# ===================================================== #
#                 RESET PASSWORD / OTP                 #
# ===================================================== #
@app.post("/auth/request-otp")
async def request_otp(req: RequestOtpBody, background_tasks: BackgroundTasks):
    email = req.email
    resp = supabase.table("users").select("*").eq("email", email).execute()
    users = get_supabase_data(resp)
    if not users:
        raise HTTPException(status_code=404, detail="User not found")

    otp_code = f"{random.randint(100000, 999999)}"
    otp_store[email] = {"otp": otp_code, "expires": datetime.utcnow() + timedelta(minutes=10)}
    background_tasks.add_task(send_email, email, otp_code)
    return {"message": "OTP sent"}

@app.post("/auth/verify-otp-reset")
async def verify_otp_reset(req: VerifyOtpBody):
    email = req.email
    otp = req.otp
    new_password = req.newPassword

    if email not in otp_store:
        raise HTTPException(status_code=400, detail="No OTP requested for this email")

    otp_data = otp_store[email]
    if otp_data["otp"] != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if datetime.utcnow() > otp_data["expires"]:
        del otp_store[email]
        raise HTTPException(status_code=400, detail="OTP expired")

    # update password
    resp = supabase.table("users").select("*").eq("email", email).execute()
    users = get_supabase_data(resp)
    user = users[0]
    if user.get("login_type") != "local":
        raise HTTPException(status_code=400, detail="Cannot reset password for Google accounts")

    hashed_pw = hash_password(new_password)
    supabase.table("users").update({"password": hashed_pw}).eq("email", email).execute()

    del otp_store[email]
    return {"message": "Password reset successful"}
