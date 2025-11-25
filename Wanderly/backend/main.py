import json
import os
from pathlib import Path
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
from typing import List
from pydantic import BaseModel
from typing import List

from PIL import Image, ImageDraw, ImageFont
import io
import base64

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

# Load environment variables
load_dotenv()

# Environment configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
# SERVICE_ACCOUNT_PATH = os.getenv("SERVICE_ACCOUNT_PATH", "serviceAccountKey.json")
service_account_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
if service_account_json:
    service_account_info = json.loads(service_account_json)
else:
    raise Exception("Service account JSON not found")

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
# cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
# firebase_admin.initialize_app(cred)
cred = credentials.Certificate(service_account_info)
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

@app.get("/")
def read_root():
    return {"message": "Backend running!"}

@app.get("/health")
def health():
    return {"status": "ok"}

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
    puzzle_base64: str
    cutout_x: int
    slider_width: int
    expires_at: datetime

def random_text(length=10):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def generate_text_box_image(width=300, height=150, text_length=8):
    img = Image.new("RGB", (width, height), color=(0, 0, 0))
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 30)

    except:
        font = ImageFont.load_default()

    text = random_text(text_length)

    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    x = (width - text_w) // 2
    y = (height - text_h) // 2
    draw.text((x, y), text, font=font, fill=(255, 255, 255))

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    base64_img = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return base64_img

@app.get("/captcha/slider/generate", response_model=SliderCaptchaGenerateResponse)
async def generate_slider_captcha():
    token = uuid.uuid4().hex
    cutout_x = random.randint(30, 250)
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    slider_captcha_storage[token] = {
        "solution": cutout_x,
        "expires_at": expires_at
    }

    puzzle_base64 = generate_text_box_image(width=300, height=150, text_length=12)

    return SliderCaptchaGenerateResponse(
        token=token,
        puzzle_base64=puzzle_base64,
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

# =====================================================
#              USER PROFILE ENDPOINTS
# =====================================================
@app.get("/users/{uid}")
async def get_user_profile(uid: str, current_uid: str = Depends(verify_jwt)):
    # Users can only access their own profile
    if current_uid != uid:
        raise HTTPException(status_code=403, detail="Access denied")
    
    resp = supabase.table("users").select("*").eq("uid", uid).execute()
    data = get_supabase_data(resp)
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = data[0]
    # Don't return password hash
    user.pop("password", None)
    return user

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

@app.put("/users/{uid}")
async def update_user_profile(uid: str, req: UpdateProfileRequest, current_uid: str = Depends(verify_jwt)):
    # Users can only update their own profile
    if current_uid != uid:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {}
    if req.name is not None:
        update_data["name"] = req.name
    if req.email is not None:
        # Check if email is already taken by another user
        resp = supabase.table("users").select("*").eq("email", req.email).execute()
        existing = get_supabase_data(resp)
        if existing and existing[0]["uid"] != uid:
            raise HTTPException(status_code=400, detail="Email already taken")
        update_data["email"] = req.email
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    supabase.table("users").update(update_data).eq("uid", uid).execute()
    
    # Fetch and return updated user
    resp = supabase.table("users").select("*").eq("uid", uid).execute()
    data = get_supabase_data(resp)
    user = data[0]
    user.pop("password", None)
    return user

# ------------------------------- SUPABASE QUERY FOR MAIN FEATURES -------------------------------

@app.get("/mock-data")
async def get_mock_data():
    # Fetch all attractions
    response = supabase.table("attraction").select("*").execute()
    attractions = response.data

    # Convert to mockPlaces format
    mockPlaces = []
    for att in attractions:
        mockPlaces.append({
            "id": str(att.get("attid")),
            "name": att.get("name"),
            "location": att.get("location"),
            "description": att.get("description"),
            "image": att.get("attpicture"),
            "rating": float(att.get("rating")),
            "category": att.get("category"),
            "price": float(att.get("price")),
            "environment": att.get("environment"),
            "favorite": att.get("favorite")
        })
    return {"mockPlaces": mockPlaces}

def insert_into_supabase(table: str, data: dict, success_msg: str):
    try:
        response = supabase.from_(table).insert(data).execute()

        # Remove .error check; instead check HTTP status
        if not hasattr(response, "data") or response.data is None:
            raise HTTPException(status_code=400, detail="Supabase insert failed")

        return {
            "message": success_msg,
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Add favorite into supabase
class Favorite(BaseModel):
    uid: str
    attid: str
    timecreated: str

@app.post("/favorites")
def add_favorite(fav: Favorite):
    return insert_into_supabase("favorite", fav.dict(), "Favorite added successfully")

@app.get("/favorites/{uid}")
def get_user_favorites(uid: str):
    try:
        response = supabase.from_("favorite").select("attid").eq("uid", uid).execute()

        # response.data contains the favorites
        if response.data is None:
            return []

        # make sure it is always a list
        if not isinstance(response.data, list):
            raise HTTPException(status_code=500, detail="Unexpected Supabase response format")

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
from fastapi import Body

@app.delete("/favorites/{uid}")
def remove_favorite(uid: str, body: dict = Body(...)):
    attid = body.get("attid")
    if not attid:
        raise HTTPException(status_code=400, detail="attid is required")
    try:
        response = supabase.from_("favorite").delete().eq("uid", uid).eq("attid", attid).execute()
        return {"message": "Favorite removed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add attraction into supabase
class Place(BaseModel):
    attpicture: str
    name: str
    location: str
    description: str
    category: List[str]
    price: float
    environment: List[str]

@app.post("/attraction")
def add_place(place: Place):
    return insert_into_supabase("attraction", place.dict(), "Place added successfully")

# Add folder into supabase
class Folder(BaseModel):
    foldername: str
    uid: str
    timecreated: str
    timeclosed: str
    status: str
    pollstatus: bool

@app.post("/folder")
def add_folder(folder: Folder):
    return insert_into_supabase("folder", folder.dict(), "Folder added successfully")

# Add folder's attraction into supabase
class FolderAtt(BaseModel):
    folderid: str
    attid: str

@app.post("/folderattraction")
def add_folderattraction(folderattraction: FolderAtt):
    return insert_into_supabase("folderattraction", folderattraction.dict(), "Folder's attraction added successfully")

@app.get("/folders")
def list_folders(uid: str):
    """
    Return all folders for a given user uid.
    """
    res = supabase.table("folder") \
        .select("*") \
        .eq("uid", uid) \
        .order("timecreated", desc=True) \
        .execute()
    return {"data": res.data}

@app.get("/folder/{folderid}")
def get_folder_detail(folderid: str):
    """
    Return folder row + its attraction rows (with picture).
    """
    # 1) Get folder
    folder_res = supabase.table("folder") \
        .select("*") \
        .eq("folderid", folderid) \
        .single() \
        .execute()

    # 2) Get attraction IDs from folderattraction
    fa_res = supabase.table("folderattraction") \
        .select("attid") \
        .eq("folderid", folderid) \
        .execute()

    fa_rows = fa_res.data or []
    att_ids = [row["attid"] for row in fa_rows]

    # 3) Get attraction details (with picture)
    attractions = []
    if att_ids:
        # Adjust columns if your names are slightly different
        at_res = supabase.table("attraction") \
            .select("attid, name, attpicture") \
            .in_("attid", att_ids) \
            .execute()
        attractions = at_res.data or []

    return {
        "folder": folder_res.data,
        "attractions": attractions,  # each has { attid, attname, attpicture }
    }

@app.get("/folders-with-preview")
def list_folders_with_preview(uid: str):
    folder_res = supabase.table("folder") \
        .select("*") \
        .eq("uid", uid) \
        .order("timecreated", desc=True) \
        .execute()

    folders = folder_res.data or []

    for folder in folders:
        fid = folder["folderid"]

        fa_res = supabase.table("folderattraction") \
            .select("attid") \
            .eq("folderid", fid) \
            .limit(3) \
            .execute()

        fa_rows = fa_res.data or []
        att_ids = [row["attid"] for row in fa_rows]

        preview_atts = []
        if att_ids:
          at_res = supabase.table("attraction") \
              .select("attid, name, attpicture") \
              .in_("attid", att_ids) \
              .execute()
          preview_atts = at_res.data or []

        folder["preview_attractions"] = preview_atts

    return {"data": folders}

@app.delete("/folder/{folderid}")
def delete_folder(folderid: str):

    # 1) Delete folderattraction rows first (foreign key)
    supabase.table("folderattraction") \
        .delete() \
        .eq("folderid", folderid) \
        .execute()

    # 2) Delete the folder
    res = supabase.table("folder") \
        .delete() \
        .eq("folderid", folderid) \
        .execute()

    return {"message": "Folder deleted", "data": res.data}

# Add voting into supabase
class Voting(BaseModel):
    folderid: str
    attid: str
    voter: str
    timevoted: str

@app.post("/voting")
def voting(voting: Voting):
    return insert_into_supabase("voting", voting.dict(), "Voted successfully")

@app.get("/voting/{folderid}")
def get_votes(folderid: str):
    """
    Return all votes for a folder.
    Frontend will aggregate counts per attraction.
    """
    res = supabase.table("voting") \
        .select("*") \
        .eq("folderid", folderid) \
        .execute()
    return {"data": res.data or []} 

class FolderEndUpdate(BaseModel):
    timeclosed: str
    pollstatus: bool

@app.patch("/folder/{folderid}/end")
def end_folder(folderid: str, payload: FolderEndUpdate):
    res = supabase.table("folder") \
        .update({
            "timeclosed": payload.timeclosed,
            "pollstatus": payload.pollstatus,
        }) \
        .eq("folderid", folderid) \
        .execute()

    return {"message": "Voting ended", "data": res.data[0] if res.data else None}