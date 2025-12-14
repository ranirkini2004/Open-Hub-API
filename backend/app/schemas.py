from pydantic import BaseModel
from typing import Optional

# What we send TO the API to create a project
class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    repo_url: str
    language: Optional[str] = None
    stars: int = 0

# What the API returns TO us
class ProjectResponse(ProjectCreate):
    id: int
    owner_id: int

    class Config:
        orm_mode = True