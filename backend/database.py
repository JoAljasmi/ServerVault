from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

#trying to load everything from .env file
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

#connecting to the database using SQLAlchemy
engine = create_engine(DATABASE_URL)
#creating a session to interact with the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
#creating a base class for the models to inherit from
Base = declarative_base()
#request db session for FastApi
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()