from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models, schemas

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/{username}", response_model=schemas.UserProfileResponse)
def get_user_profile(username: str, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/profile/me")
def update_my_profile(
    profile_data: schemas.UserUpdate,
    username: str, 
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update all fields
    if profile_data.bio is not None:
        user.bio = profile_data.bio
    if profile_data.skills is not None:
        user.skills = profile_data.skills
    if profile_data.linkedin is not None:
        user.linkedin = profile_data.linkedin
        
    # --- NEW FIELDS ---
    if profile_data.full_name is not None:
        user.full_name = profile_data.full_name
    if profile_data.department is not None:
        user.department = profile_data.department
    if profile_data.year is not None:
        user.year = profile_data.year
    # ------------------
        
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully", "user": user}