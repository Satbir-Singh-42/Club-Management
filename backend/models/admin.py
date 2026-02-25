from sqlmodel import SQLModel, Field
from datetime import datetime


class _BaseAdmin(SQLModel):
    email: str = Field(unique=True, index=True)
    name: str
    password: str


class AdminModel(_BaseAdmin, table=True):
    __tablename__ = "admins"  # type: ignore
    id: int | None = Field(default=None, primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    deleted_at: datetime | None = None


class Admin(_BaseAdmin):
    id: int = Field(...)
    created_at: datetime
    updated_at: datetime 