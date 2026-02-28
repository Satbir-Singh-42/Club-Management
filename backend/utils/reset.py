from sqlmodel import SQLModel
from backend.database import engine
from backend.models import *  # noqa - ensure all models are loaded

# Drop all tables
SQLModel.metadata.drop_all(engine)
# Re-create all tables
SQLModel.metadata.create_all(engine)

print("Database reset complete.")
