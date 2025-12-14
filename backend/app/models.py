from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(String, unique=True, index=True) # ID from GitHub
    username = Column(String, unique=True, index=True)
    email = Column(String, nullable=True)
    avatar_url = Column(String)
    
    # Relationships
    projects = relationship("Project", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    repo_url = Column(String)
    language = Column(String) # Primary language (e.g., Python)
    stars = Column(Integer, default=0)
    
    # Foreign Key
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    collab_requests = relationship("CollabRequest", back_populates="project")

class CollabRequest(Base):
    __tablename__ = "collab_requests"

    id = Column(Integer, primary_key=True, index=True)
    role_needed = Column(String) # e.g., "Frontend Dev"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project_id = Column(Integer, ForeignKey("projects.id"))
    project = relationship("Project", back_populates="collab_requests")