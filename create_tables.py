from app import create_app
from app.models import db, BlogPost

app = create_app()

with app.app_context():
    # Criar a tabela BlogPost se ela não existir
    db.create_all()
    print("Tabelas criadas com sucesso!")