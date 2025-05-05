from app import create_app
from app.models import db, BlogPost

app = create_app()

with app.app_context():
    # Verificar se a tabela existe
    print("Verificando tabelas existentes...")
    insp = db.inspect(db.engine)
    existing_tables = insp.get_table_names()
    
    if "blog_post" in existing_tables:
        print("Removendo tabela blog_post existente...")
        # Remover tabela blog_post se existir
        BlogPost.__table__.drop(db.engine)
        print("Tabela blog_post removida.")
    
    # Recriar a tabela blog_post
    print("Recriando tabela blog_post com a estrutura correta...")
    BlogPost.__table__.create(db.engine)
    print("Tabela blog_post recriada com sucesso!")
    
    # Verificar se a coluna slug existe agora
    try:
        columns = insp.get_columns('blog_post')
        column_names = [column['name'] for column in columns]  # Acesso correto aos nomes das colunas
        print(f"Colunas na tabela blog_post: {', '.join(column_names)}")
        
        if 'slug' in column_names:
            print("Coluna 'slug' foi criada com sucesso!")
        else:
            print("ERRO: A coluna 'slug' não foi criada!")
    except Exception as e:
        print(f"Erro ao verificar colunas: {e}")
        print("A tabela foi recriada, mas não foi possível verificar as colunas.")