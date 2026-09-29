from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Load variables from .env
load_dotenv()

# Get the database URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Create the database engine
engine = create_engine(DATABASE_URL)

# Create a database session
SessionLocal = sessionmaker(bind=engine)


# Create a database session for FastAPI
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()