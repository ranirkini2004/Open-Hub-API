from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import database, models, config
import httpx # Like 'requests' but async

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.get("/login")
def login_github():
    """
    Redirects the user to GitHub's OAuth page.
    """
    return {
        "url": f"https://github.com/login/oauth/authorize?client_id={config.settings.GITHUB_CLIENT_ID}&scope=read:user"
    }

@router.get("/callback")
async def github_callback(code: str, db: Session = Depends(database.get_db)):
    """
    1. Receives the 'code' from GitHub.
    2. Exchanges it for an 'access_token'.
    3. Fetches user profile from GitHub.
    4. Creates/Updates the user in our database.
    """
    
    # 1. Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": config.settings.GITHUB_CLIENT_ID,
                "client_secret": config.settings.GITHUB_CLIENT_SECRET,
                "code": code
            }
        )
        token_data = token_res.json()
        
    if "error" in token_data:
        raise HTTPException(status_code=400, detail="Invalid GitHub Code")
        
    access_token = token_data["access_token"]

    # 2. Fetch User Info from GitHub
    async with httpx.AsyncClient() as client:
        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        github_user = user_res.json()

    # 3. Check if user exists in DB, if not create them
    existing_user = db.query(models.User).filter(models.User.github_id == str(github_user["id"])).first()

    if not existing_user:
        new_user = models.User(
            github_id=str(github_user["id"]),
            username=github_user["login"],
            email=github_user.get("email"),
            avatar_url=github_user["avatar_url"]
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "User Created", "user": new_user, "access_token": access_token}
    
    # ### LOOK HERE: I added "access_token": access_token here too ###
    return {"message": "User Logged In", "user": existing_user, "access_token": access_token}