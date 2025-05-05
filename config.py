from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY') or 'you-will-never-guess'
    DEBUG = os.getenv('DEBUG', 'False').lower() in ['true', '1', 't']
    
    # Configurações de email
    MAIL_SERVER = os.getenv('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.getenv('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() in ['true', '1', 't']
    MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', 'False').lower() in ['true', '1', 't']
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = ('FS Eletromcz', os.getenv('MAIL_USERNAME'))
    
    # Configurações do banco de dados
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') or 'sqlite:///fs_eletromcz.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Pasta para upload de imagens de produtos
    UPLOAD_FOLDER = os.path.join('app', 'static', 'img', 'products')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB limite para uploads
