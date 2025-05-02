from app import create_app
import os

# Definir a variável de ambiente para desabilitar o carregamento automático do .env pelo Flask
os.environ["FLASK_SKIP_DOTENV"] = "1"

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)