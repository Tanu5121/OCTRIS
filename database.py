import os
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# PostgreSQL database URL
DATABASE_URL = "postgresql://postgres:aishwarya%403456@localhost:5432/traffic_intelligence"


# Create database engine
engine = create_engine(
    DATABASE_URL
)


# Create database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Base class for database models
Base = declarative_base()


# Database dependency
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()