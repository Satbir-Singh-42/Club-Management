import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import database
from sqlmodel import SQLModel

engine = database.engine
# Drop all tables
SQLModel.metadata.drop_all(engine)
# Re-create all tables
SQLModel.metadata.create_all(engine)
