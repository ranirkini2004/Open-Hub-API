from fastapi import APIRouter, Depends, HTTPException, Header, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from .. import database, models, schemas

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

# ==========================================
# 📧 EMAIL CONFIGURATION (MUST FILL THIS!)
# ==========================================
conf = ConnectionConfig(
    MAIL_USERNAME="andcanara0@gmail.com",      # <--- 1. PUT YOUR GMAIL
    MAIL_PASSWORD="morngvgkrxflwzbi",      # <--- 2. PUT APP PASSWORD
    MAIL_FROM="andcanara0@gmail.com",          # <--- 3. SAME AS USERNAME
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_acceptance_email(email_to: str, username: str, project_title: str):
    """
    Sends the actual email using FastMail
    """
    html = f"""
    <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #2563EB;">Congratulations {username}! 🚀</h2>
        <p>You have been officially <b>ACCEPTED</b> to join the project:</p>
        <h3 style="background-color: #f3f4f6; padding: 10px; border-radius: 5px;">{project_title}</h3>
        <p>Head over to your dashboard to collaborate with the team.</p>
        <br>
        <p>Happy Coding,<br><b>The OpenCollab Team</b></p>
    </div>
    """

    message = MessageSchema(
        subject=f"Accepted! You joined {project_title}",
        recipients=[email_to],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)

# ==========================================
# 🛠️ HELPER & ENDPOINTS
# ==========================================

def get_user_from_db(username: str, db: Session):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# 1. GitHub Repos
@router.get("/github/repos")
async def list_github_repos(username: str, access_token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.github.com/users/{username}/repos",
            headers={"Authorization": f"Bearer {access_token}"}
        )
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch repos from GitHub")
        
    repos = response.json()
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

# 2. Get Owned Projects
@router.get("/owned", response_model=List[schemas.ProjectResponse])
def get_owned_projects(username: str, db: Session = Depends(database.get_db)):
    user = get_user_from_db(username, db)
    return db.query(models.Project).filter(models.Project.owner_id == user.id).all()

# 3. Delete Project
@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, username: str, db: Session = Depends(database.get_db)):
    user = get_user_from_db(username, db)
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    
    db.query(models.CollabRequest).filter(models.CollabRequest.project_id == project_id).delete()
    db.delete(project)
    db.commit()
    return None

# 4. Create Project
@router.post("/", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, username: str, db: Session = Depends(database.get_db)):
    user = get_user_from_db(username, db)
    existing_project = db.query(models.Project).filter(models.Project.repo_url == project.repo_url).first()
    if existing_project:
        raise HTTPException(status_code=400, detail="Project already imported")

    new_project = models.Project(**project.dict(), owner_id=user.id)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

# 5. Get All Projects
@router.get("/", response_model=List[schemas.ProjectResponse])
def get_all_projects(search: Optional[str] = None, db: Session = Depends(database.get_db)):
    query = db.query(models.Project)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (models.Project.title.ilike(search_fmt)) | 
            (models.Project.language.ilike(search_fmt))
        )
    return query.all()

# 6. Send Join Request
@router.post("/request", status_code=status.HTTP_201_CREATED)
def send_join_request(request: schemas.RequestCreate, username: str, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_req = db.query(models.CollabRequest).filter(
        models.CollabRequest.sender_id == user.id,
        models.CollabRequest.project_id == request.project_id
    ).first()

    if existing_req:
        raise HTTPException(status_code=400, detail="Request already sent!")

    new_req = models.CollabRequest(sender_id=user.id, project_id=request.project_id)
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return {"message": "Request sent successfully"}

# 7. Get Pending Requests (Updated to include repo_url)
@router.get("/requests/pending")
def get_pending_requests(username: str, db: Session = Depends(database.get_db)):
    user = get_user_from_db(username, db)
    requests = db.query(models.CollabRequest)\
        .join(models.Project)\
        .filter(models.Project.owner_id == user.id)\
        .filter(models.CollabRequest.status == "pending")\
        .all()

    return [{
        "id": r.id,
        "project_title": r.project.title,
        "project_repo_url": r.project.repo_url, # <--- NEW FIELD ADDED
        "sender_username": r.sender.username,
        "sender_avatar": r.sender.avatar_url
    } for r in requests]

# ==========================================
# 🚀 8. UPDATE REQUEST (REAL EMAIL LOGIC)
# ==========================================
@router.put("/requests/{request_id}")
async def update_request_status(
    request_id: int, 
    status_update: dict, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(database.get_db)
):
    req = db.query(models.CollabRequest).filter(models.CollabRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    req.status = status_update['status']
    db.commit()

    # --- EMAIL LOGIC START ---
    if status_update['status'] == "accepted":
        print(f"✅ User {req.sender.username} accepted. Checking for email...")
        
        # 1. Get the REAL email from the user's profile
        recipient = req.sender.email 

        if recipient:
            print(f"📧 Sending acceptance email to: {recipient}")
            # Run in background so it doesn't freeze the button
            background_tasks.add_task(
                send_acceptance_email, 
                recipient, 
                req.sender.username, 
                req.project.title
            )
        else:
            print(f"⚠️ User {req.sender.username} has not set an email in their profile. Email skipped.")
    # -------------------------

    return {"message": "Status updated"}

# 9. Get Joined Projects
@router.get("/joined", response_model=List[schemas.ProjectResponse])
def get_joined_projects(username: str, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        return [] 

    joined_requests = db.query(models.CollabRequest)\
        .filter(models.CollabRequest.sender_id == user.id)\
        .filter(models.CollabRequest.status == "accepted")\
        .all()
    
    return [req.project for req in joined_requests]

# 10. Project Details (LAST)
@router.get("/{project_id}", response_model=schemas.ProjectDetailResponse)
def get_project_details(project_id: int, db: Session = Depends(database.get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    accepted_requests = db.query(models.CollabRequest)\
        .filter(models.CollabRequest.project_id == project_id)\
        .filter(models.CollabRequest.status == "accepted")\
        .all()
    
    project.team = [req.sender for req in accepted_requests]
    return project