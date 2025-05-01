from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY') or 'you-will-never-guess'
    DEBUG = os.getenv('DEBUG', 'False').lower() in ['true', '1', 't']
    # Add other configuration variables as needed
