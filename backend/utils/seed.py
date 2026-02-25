from pydantic_extra_types.phone_numbers import PhoneNumber
from sqlmodel import Session
import pandas as pd
from datetime import datetime
from backend.lib.auth import get_password_hash
from backend.models.student import Branch, StudentModel
from backend.models.club import ClubModel
from backend.models.event import EventModel
from backend import database
import os

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))

def seed_db():
    session: Session = next(database.get_session())
    try:
        read_students()
        read_clubs()
        read_events()
        print("seeded successfully")
    except Exception as e:
        print("Error: " + str(e))
    finally:
        session.close()


def read_students():
    file_path = os.path.join(script_dir, "../sample_data/students.csv")
    print("file path: ", file_path);
    df = pd.read_csv(file_path)
    print(df);
    session: Session = next(database.get_session())
    for index, row in df.iterrows():
        student = StudentModel(
            email=str(row["email"]),
            name=str(row["name"]),
            crn=str(row["crn"]),
            urn=str(row["urn"]),
            branch=Branch(row["branch"]),
            batch=int(row["batch"]),
            phone=PhoneNumber(row["phone"]),
            password=get_password_hash(str(row["password"])),
        )
        session.add(student)
    session.commit()


def read_clubs():
    file_path = os.path.join(script_dir, "../sample_data/clubs.csv")
    df = pd.read_csv(file_path)
    session: Session = next(database.get_session())
    for index, row in df.iterrows():
        club = ClubModel(
            email=str(row["email"]),
            name=str(row["name"]),
            acronym=str(row["acronym"]),
            tagline=str(row["tagline"]),
            description=str(row["description"]),
            password=get_password_hash(str(row["password"])),
            logo=str(row["logo"]),
        )
        session.add(club)
    session.commit()


def read_events():
    file_path = os.path.join(script_dir, "../sample_data/events.csv")
    df = pd.read_csv(file_path)
    session: Session = next(database.get_session())
    for index, row in df.iterrows():
        event = EventModel(
            name=str(row["name"]),
            description=str(row["description"]),
            rules=str(row["rules"]),
            date=datetime.strptime(str(row["date"]), "%Y-%m-%d").date(),
            time=datetime.strptime(str(row["time"]), "%H:%M:%S").time(),
            venue=str(row["venue"]),
            poster=str(row["poster"]),
            team_size=int(row["team_size"]),
            club_id=int(row["club_id"]),
        )
        session.add(event)
    session.commit()


seed_db()
