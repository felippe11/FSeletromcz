from flask import Flask
from flask_mail import Mail
from flask_login import LoginManager
from config import Config
from .models import db, User

# Criando instância de Mail que será importada por routes.py
mail = Mail()
login_manager = LoginManager()
login_manager.login_view = 'main.login'
login_manager.login_message = 'Por favor, faça login para acessar esta área.'
login_manager.login_message_category = 'warning'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='static')
    
    # Configurações da aplicação
    app.config.from_object(config_class)
    
    # Inicializando extensões
    mail.init_app(app)
    db.init_app(app)
    login_manager.init_app(app)
    
    # Garantir que as pastas de upload existam
    import os
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    # Importando e registrando as rotas
    from .routes import main
    app.register_blueprint(main)

    # Criar tabelas do banco de dados
    with app.app_context():
        db.create_all()
        # Criar usuário admin padrão se não existir nenhum
        if not User.query.first():
            admin = User(username='admin', is_admin=True)
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()

    return app