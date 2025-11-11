import os
import uuid
import random
import string
import urllib.parse
from datetime import datetime, timedelta
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from jose import jwt, JWTError
from supabase import create_client

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Backend running!"}

@app.get("/health")
def health():
    return {"status": "ok"}

# Load environment variables
load_dotenv()

# Environment configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
SERVICE_ACCOUNT_PATH = os.getenv("SERVICE_ACCOUNT_PATH", "serviceAccountKey.json")

# Mail configuration
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_STARTTLS = os.getenv("MAIL_STARTTLS", "True").lower() == "true"
MAIL_SSL_TLS = os.getenv("MAIL_SSL_TLS", "False").lower() == "true"

conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_FROM,
    MAIL_PORT=MAIL_PORT,
    MAIL_SERVER=MAIL_SERVER,
    MAIL_STARTTLS=MAIL_STARTTLS,
    MAIL_SSL_TLS=MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)
fm = FastMail(conf)

# Initialize Supabase and Firebase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# FastAPI setup
app = FastAPI()
security = HTTPBearer()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Helper functions ----------------
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

# Temporary storages
otp_storage = {}
slider_captcha_storage = {}

# =====================================================
#                    GOOGLE LOGIN
# =====================================================
class TokenRequest(BaseModel):
    id_token: str

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

# =====================================================
#               REGISTER & LOGIN (LOCAL)
# =====================================================
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

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

# =====================================================
#              JWT VERIFY & DASHBOARD
# =====================================================
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

# =====================================================
#                OTP PASSWORD RESET
# =====================================================
class OTPRequestBody(BaseModel):
    email: EmailStr

class OTPVerifyBody(BaseModel):
    email: EmailStr
    otp: str
    newPassword: str

@app.post("/auth/request-otp")
async def request_otp(req: OTPRequestBody):
    email = req.email
    resp = supabase.table("users").select("*").eq("email", email).execute()
    users = get_supabase_data(resp)
    if not users:
        raise HTTPException(status_code=404, detail="User not found")

    otp = str(random.randint(100000, 999999))
    otp_storage[email] = otp

    message = MessageSchema(
        subject="Your OTP Code",
        recipients=[email],
        body=f"Your OTP for password reset is: {otp}",
        subtype="plain"
    )
    await fm.send_message(message)
    return {"message": "OTP sent to your email"}

@app.post("/auth/verify-otp-reset")
async def verify_otp_reset(req: OTPVerifyBody):
    email = req.email
    otp = req.otp
    new_password = req.newPassword

    if email not in otp_storage or otp_storage[email] != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password too short")

    hashed_pw = hash_password(new_password)
    supabase.table("users").update({"password": hashed_pw}).eq("email", email).execute()
    otp_storage.pop(email, None)
    return {"message": "Password reset successful"}

# =====================================================
#                 OTP SIGNUP FLOW
# =====================================================
class VerifySignupOTPBody(BaseModel):
    email: EmailStr
    otp: str
    password: str
    name: Optional[str] = None

@app.post("/auth/send-otp-signup")
async def send_otp_signup(req: OTPRequestBody):
    resp = supabase.table("users").select("*").eq("email", req.email).execute()
    existing = get_supabase_data(resp)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    otp = str(random.randint(100000, 999999))
    otp_storage[req.email] = otp

    message = MessageSchema(
        subject="Your Wanderly Signup OTP",
        recipients=[req.email],
        body=f"Your OTP for signup is: {otp}",
        subtype="plain"
    )
    await fm.send_message(message)
    return {"message": "OTP sent for signup verification"}

@app.post("/auth/verify-otp-signup")
async def verify_otp_signup(req: VerifySignupOTPBody):
    email = req.email
    otp = req.otp
    password = req.password
    name = req.name

    if email not in otp_storage or otp_storage[email] != otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    resp = supabase.table("users").select("*").eq("email", email).execute()
    existing = get_supabase_data(resp)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password too short")

    hashed_pw = hash_password(password)
    user = {
        "email": email,
        "password": hashed_pw,
        "name": name or email.split("@")[0],
        "uid": f"local_{uuid.uuid4().hex}",
        "picture": None,
        "login_type": "local"
    }

    supabase.table("users").insert(user).execute()
    token = create_access_token(subject=user["uid"])
    otp_storage.pop(email, None)
    return {"message": "Signup successful", "access_token": token, "user": user}

# =====================================================
#               SLIDER CAPTCHA GENERATOR
# =====================================================
class SliderCaptchaGenerateResponse(BaseModel):
    token: str
    puzzle_url: str
    cutout_x: int
    slider_width: int
    expires_at: datetime

def random_text(length=10):
    chars = string.ascii_letters + string.digits + " "
    return ''.join(random.choice(chars) for _ in range(length))

@app.get("/captcha/slider/generate", response_model=SliderCaptchaGenerateResponse)
async def generate_slider_captcha():
    token = uuid.uuid4().hex
    cutout_x = random.randint(30, 250)
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    slider_captcha_storage[token] = {
        "solution": cutout_x,
        "expires_at": expires_at
    }

    text = random_text(12)
    encoded_text = urllib.parse.quote_plus(text)
    puzzle_url = f"https://dummyimage.com/300x150/000/fff.png&text={encoded_text}"

    return SliderCaptchaGenerateResponse(
        token=token,
        puzzle_url=puzzle_url,
        cutout_x=cutout_x,
        slider_width=100,
        expires_at=expires_at
    )

class SliderCaptchaVerifyRequest(BaseModel):
    token: str
    position: int
    tolerance: int = 5

@app.post("/captcha/slider/verify")
async def verify_slider_captcha(payload: SliderCaptchaVerifyRequest):
    data = slider_captcha_storage.get(payload.token)
    if not data:
        raise HTTPException(status_code=400, detail="Invalid CAPTCHA token")
    if datetime.utcnow() > data["expires_at"]:
        slider_captcha_storage.pop(payload.token, None)
        raise HTTPException(status_code=400, detail="CAPTCHA expired")
    if abs(payload.position - data["solution"]) > payload.tolerance:
        raise HTTPException(status_code=400, detail="Incorrect slider position")
    slider_captcha_storage.pop(payload.token, None)
    return {"message": "Slider CAPTCHA verified successfully"}
