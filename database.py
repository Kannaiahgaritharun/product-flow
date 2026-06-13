from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base

db_url = db_url = "postgresql://postgres:Tharun%409342@localhost:5432/postgres"
engine = create_engine(db_url)
session = sessionmaker(autocommit=False,autoflush=False,bind=engine)
Base = declarative_base()