from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import List, Optional
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
def get_all_projects(
    search: Optional[str] = None, 
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Project)
    
    if search:
        # Filter where Title OR Language contains the search term (Case insensitive)
        search_fmt = f"%{search}%"
        query = query.filter(
            (models.Project.title.ilike(search_fmt)) | 
            (models.Project.language.ilike(search_fmt))
        )
    
    return query.all()

@router.post("/request", status_code=status.HTTP_201_CREATED)
def send_join_request(
    request: schemas.RequestCreate,
    username: str, # We will pass username from frontend
    db: Session = Depends(database.get_db)
):
    # 1. Find the User sending the request
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Check if request already exists
    existing_req = db.query(models.CollabRequest).filter(
        models.CollabRequest.sender_id == user.id,
        models.CollabRequest.project_id == request.project_id
    ).first()

    if existing_req:
        raise HTTPException(status_code=400, detail="Request already sent!")

    # 3. Create the request
    new_req = models.CollabRequest(
        sender_id=user.id,
        project_id=request.project_id
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    
    return {"message": "Request sent successfully"}

# 1. Get all pending requests for the current user's projects
@router.get("/requests/pending")
def get_pending_requests(username: str, db: Session = Depends(database.get_db)):
    user = get_user_from_db(username, db)

    # Complex Query: Join Request -> Project -> Owner
    # "Find requests where the project's owner is ME"
    requests = db.query(models.CollabRequest)\
        .join(models.Project)\
        .filter(models.Project.owner_id == user.id)\
        .filter(models.CollabRequest.status == "pending")\
        .all()

    # Format the data nicely for the frontend
    return [{
        "id": r.id,
        "project_title": r.project.title,
        "sender_username": r.sender.username, # Make sure User model has this relationship!
        "sender_avatar": r.sender.avatar_url
    } for r in requests]

# 2. Accept or Reject a request
@router.put("/requests/{request_id}")
def update_request_status(
    request_id: int, 
    status_update: dict, # Expects {"status": "accepted"} or "rejected"
    db: Session = Depends(database.get_db)
):
    req = db.query(models.CollabRequest).filter(models.CollabRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    req.status = status_update['status']
    db.commit()
    return {"message": "Status updated"}

@router.get("/joined")
def get_joined_projects(username: str, db: Session = Depends(database.get_db)):
    user = get_user_from_db(username, db)
    
    # Find requests where:
    # 1. I am the sender
    # 2. The status is 'accepted'
    joined_requests = db.query(models.CollabRequest)\
        .filter(models.CollabRequest.sender_id == user.id)\
        .filter(models.CollabRequest.status == "accepted")\
        .all()
    
    # Return the actual PROJECT details, not just the request
    return [req.project for req in joined_requests]