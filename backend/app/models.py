from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, nullable=True)
    avatar_url = Column(String)

    # --- PROFILE FIELDS ---
    bio = Column(String, nullable=True)
    skills = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    
    # --- NEW PERSONAL DETAILS ---
    full_name = Column(String, nullable=True)   # e.g. "Rani Kini"
    department = Column(String, nullable=True)  # e.g. "CSE"
    year = Column(String, nullable=True)        # e.g. "3rd Year"
    # ----------------------------

class Project(Base):
    __tablename__ = "projects"
    # ... (Keep the rest of the file exactly the same) ...
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    repo_url = Column(String)
    language = Column(String)
    stars = Column(Integer)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User")

class CollabRequest(Base):
    __tablename__ = "collab_requests"
    # ... (Keep the rest of the file exactly the same) ...
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    status = Column(String, default="pending") 

    sender = relationship("User", foreign_keys=[sender_id])
    project = relationship("Project", foreign_keys=[project_id])