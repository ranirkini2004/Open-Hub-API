from pydantic import BaseModel
from typing import List, Optional

# ... (Keep UserBase, ProjectBase, ProjectCreate, ProjectResponse, RequestCreate, RequestResponse AS IS) ...
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

# --- UPDATE THESE TWO CLASSES ---
class UserUpdate(BaseModel):
    bio: Optional[str] = None
    skills: Optional[str] = None
    linkedin: Optional[str] = None
    full_name: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None

class UserProfileResponse(BaseModel):
    username: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    linkedin: Optional[str] = None
    full_name: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    
    class Config:
        orm_mode = True