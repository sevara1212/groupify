from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import bcrypt

router = APIRouter()

# In-memory store for demo purposes
users_db = {}

class RegisterPayload(BaseModel):
    username: str
    password: str

class LoginPayload(BaseModel):
    username: str
    password: str

@router.post("/auth/register")
def register(payload: RegisterPayload):
    if payload.username in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Hash password with bcrypt (automatically salted)
    hashed = bcrypt.hashpw(payload.password.encode("utf-8"), bcrypt.gensalt())
    users_db[payload.username] = hashed
    
    return {"message": "User registered successfully"}

@router.post("/auth/login")
def login(payload: LoginPayload):
    stored_hash = users_db.get(payload.username)
    if not stored_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password against stored hash
    if not bcrypt.checkpw(payload.password.encode("utf-8"), stored_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"message": "Login successful", "username": payload.username}