from flask import Flask
from flask_mail import Mail
from config import Config

# Criando instância de Mail que será importada por routes.py
mail = Mail()

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='static')
    
    # Configurações da aplicação
    app.config.from_object(config_class)
    
    # Inicializando extensões
    mail.init_app(app)

    # Importando e registrando as rotas
    from .routes import main
    app.register_blueprint(main)

    return app