from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routers import auth, projects, users # <--- Added users

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Open Collab Hub API")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <--- CHANGE THIS TO "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(users.router) # <--- Added this line

@app.get("/")
def read_root():
    return {"message": "Welcome to Open Collab Hub API"}