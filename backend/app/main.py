from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <--- 1. IMPORT THIS
from . import models
from .database import engine
from .routers import auth, projects

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Open Collab Hub API")

# 2. ADD THIS MIDDLEWARE BLOCK
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Allow Frontend to talk to Backend
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)

app.include_router(auth.router)
app.include_router(projects.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Open Collab Hub API"}