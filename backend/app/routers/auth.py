import os
import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, utils

router = APIRouter()

class GitHubLogin(BaseModel):
    code: str

@router.post("/auth/github")
async def github_login(login: GitHubLogin, db: Session = Depends(get_db)):
    # 👇 READS KEYS FROM RENDER DASHBOARD
    client_id = os.getenv("GITHUB_CLIENT_ID")
    client_secret = os.getenv("GITHUB_CLIENT_SECRET")

    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="Server Error: GitHub keys not configured in Render.")

    # 1. Exchange 'code' for 'access_token'
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "code": login.code,
            },
        )
        token_data = resp.json()
    
    if "error" in token_data:
        raise HTTPException(status_code=400, detail="Invalid GitHub Code")
    
    access_token = token_data["access_token"]

    # 2. Get User Info
    async with httpx.AsyncClient() as client:
        user_resp = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        github_user = user_resp.json()

    # 3. Find or Create User
    username = github_user["login"]
    user = db.query(models.User).filter(models.User.username == username).first()
    
    if not user:
        user = models.User(
            username=username,
            email=github_user.get("email") or f"{username}@github.com",
            password=utils.hash("github_user"), 
            avatar_url=github_user.get("avatar_url", "")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 4. Create Token
    token = utils.create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "username": user.username}