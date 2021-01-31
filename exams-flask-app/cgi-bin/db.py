from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
engine = create_engine("mysql://eApp:odroid@localhost/entities?charset=utf8", pool_size = 5, pool_recycle=280, pool_pre_ping=True)
Session = sessionmaker(bind=engine)
Base = declarative_base()

