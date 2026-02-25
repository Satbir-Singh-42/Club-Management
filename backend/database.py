from typing import Annotated
from fastapi import Depends
from sqlmodel import Session, create_engine
from backend.models import *  # noqa

sqlite_file = "clubhub.db"
sqlite_url = f"sqlite:///{sqlite_file}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def get_session():
    with Session(engine) as session:
        yield session


DBSession = Annotated[Session, Depends(get_session)]
