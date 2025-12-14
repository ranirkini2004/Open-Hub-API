from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List
import httpx
from .. import database, models, schemas

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

# 1. Helper: Get current user by checking if they exist (Simple version)
# In a real app, we would verify the JWT token here.
def get_user_from_db(username: str, db: Session):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Endpoint A: List user's repositories from GitHub
@router.get("/github/repos")
async def list_github_repos(username: str, access_token: str = Header(...)):
    """
    Fetches public repositories for the authenticated user directly from GitHub.
    We pass the 'access_token' in the header to prove who we are.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.github.com/users/{username}/repos",
            headers={"Authorization": f"Bearer {access_token}"}
        )
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch repos from GitHub")
        
    repos = response.json()
    
    # Clean up the data to just return what we need
    cleaned_repos = []
    for repo in repos:
        cleaned_repos.append({
            "title": repo["name"],
            "description": repo["description"],
            "repo_url": repo["html_url"],
            "language": repo["language"],
            "stars": repo["stargazers_count"]
        })
    
    return cleaned_repos

# Endpoint B: Import (Save) a project to our Database
@router.post("/", response_model=schemas.ProjectResponse)
def create_project(
    project: schemas.ProjectCreate, 
    username: str, 
    db: Session = Depends(database.get_db)
):
    """
    Saves a chosen repository into our 'projects' table.
    """
    user = get_user_from_db(username, db)
    
    # Check if project already exists
    existing_project = db.query(models.Project).filter(models.Project.repo_url == project.repo_url).first()
    if existing_project:
        raise HTTPException(status_code=400, detail="Project already imported")

    new_project = models.Project(
        **project.dict(),
        owner_id=user.id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

# Endpoint C: Get all projects (The Public Feed)
@router.get("/", response_model=List[schemas.ProjectResponse])
def get_all_projects(db: Session = Depends(database.get_db)):
    projects = db.query(models.Project).all()
    return projects