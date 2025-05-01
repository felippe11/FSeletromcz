from flask import Flask
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    
    # Configurações da aplicação
    app.config.from_object(config_class)

    # Importando e registrando as rotas
    from .routes import main
    app.register_blueprint(main)

    return app