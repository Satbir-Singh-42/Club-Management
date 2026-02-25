from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel
from dotenv import load_dotenv

from backend import config
from backend.database import engine
from backend.routes import (
    auth,
    register,
    event,
    club,
    password_reset,
    student,
    registration,
    application,
    admin,
)


# Load the .env file and create the database tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    load_dotenv()
    SQLModel.metadata.create_all(engine)
    yield


# Create the FastAPI app
app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/storage", StaticFiles(directory="storage"), name="storage")

# Mount sub routers
app.include_router(auth.app)
app.include_router(register.app)
app.include_router(password_reset.app)
app.include_router(event.app)
app.include_router(club.app)
app.include_router(student.app)
app.include_router(registration.router)
app.include_router(application.router)
app.include_router(admin.router)


# Ping route
@app.get("/")
async def root():
    return {"message": "Hello World"}
