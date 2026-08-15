from dotenv import load_dotenv
import os

load_dotenv()


def _database_url():
    url = os.getenv('DATABASE_URL')

    if not url:
        if os.getenv('RENDER'):
            raise RuntimeError(
                'DATABASE_URL precisa estar configurada no Render; '
                'o fallback SQLite e inseguro em producao.'
            )

        return 'sqlite:///' + os.path.join(
            os.path.abspath(os.path.dirname(__file__)),
            'app',
            'static',
            'img',
            'products',
            'fs_eletromcz.db',
        )

    # URLs antigas de provedores usam postgres://, enquanto o SQLAlchemy 2
    # espera o nome completo do dialeto.
    if url.startswith('postgres://'):
        url = 'postgresql://' + url[len('postgres://'):]

    if url.startswith('postgresql://') and 'sslmode=' not in url:
        separator = '&' if '?' in url else '?'
        url = f'{url}{separator}sslmode=require'

    return url


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
    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }
    
    # Pasta para upload de imagens de produtos
    UPLOAD_FOLDER = os.path.join('app', 'static', 'img', 'products')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB limite para uploads
