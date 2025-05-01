# FS Eletromcz Web

Este projeto é uma aplicação web desenvolvida com Flask, destinada a fornecer informações e serviços relacionados à FS Eletromcz, uma empresa de soluções elétricas profissionais.

## Estrutura do Projeto

```
fs_eletromcz_web
├── app
│   ├── __init__.py
│   ├── routes.py
│   ├── static
│   │   ├── css
│   │   │   └── style.css
│   │   ├── js
│   │   │   └── main.js
│   │   └── img
│   └── templates
│       └── index.html
├── config.py
├── run.py
├── requirements.txt
└── README.md
```

## Instalação

1. Clone o repositório:
   ```
   git clone <URL_DO_REPOSITORIO>
   cd fs_eletromcz_web
   ```

2. Crie um ambiente virtual:
   ```
   python -m venv venv
   ```

3. Ative o ambiente virtual:
   - No Windows:
     ```
     venv\Scripts\activate
     ```
   - No macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Instale as dependências:
   ```
   pip install -r requirements.txt
   ```

## Execução

Para executar a aplicação, utilize o seguinte comando:
```
python run.py
```

A aplicação estará disponível em `http://127.0.0.1:5000`.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

## Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo LICENSE para mais detalhes.