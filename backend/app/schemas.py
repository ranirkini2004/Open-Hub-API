from pydantic import BaseModel
from typing import List, Optional

# --- EXISTING SCHEMAS ---
class UserBase(BaseModel):
    username: str
    avatar_url: Optional[str] = None

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    repo_url: str
    language: Optional[str] = None
    stars: int

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    owner_id: int
    owner: UserBase
    class Config:
        orm_mode = True

class RequestCreate(BaseModel):
    project_id: int

class RequestResponse(BaseModel):
    id: int
    sender_id: int
    project_id: int
    status: str
    class Config:
        orm_mode = True

# --- UPDATED PROFILE SCHEMAS ---
class UserUpdate(BaseModel):
    bio: Optional[str] = None
    skills: Optional[str] = None
    linkedin: Optional[str] = None
    full_name: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    discord_handle: Optional[str] = None # <--- NEW

class UserProfileResponse(BaseModel):
    username: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    linkedin: Optional[str] = None
    full_name: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    discord_handle: Optional[str] = None # <--- NEW
    
    class Config:
        orm_mode = True

# Response for a single project details page
class ProjectDetailResponse(ProjectResponse):
    team: List[UserBase] # List of accepted members