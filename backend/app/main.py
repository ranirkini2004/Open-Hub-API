from fastapi import FastAPI
from . import models
from .database import engine

# Create the database tables automatically
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Open Collab Hub API")

@app.get("/")
def read_root():
    return {"message": "Welcome to Open Collab Hub API"}

# We will add routers (auth, projects) here in the next step