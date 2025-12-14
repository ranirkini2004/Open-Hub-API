from fastapi import FastAPI
from . import models
from .database import engine
from .routers import auth  # <--- Import the router
from .routers import auth, projects

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Open Collab Hub API")

app.include_router(auth.router) # <--- Activate the router
app.include_router(projects.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Open Collab Hub API"}