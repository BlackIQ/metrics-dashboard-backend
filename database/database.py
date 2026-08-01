# SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Application
from core.settings import settings  # Settings

# Engine
engine = create_engine(settings.postgresql_url, pool_pre_ping=True)

# Session
session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
