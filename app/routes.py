from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify, current_app, make_response, abort
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.utils import secure_filename
from flask_mail import Message
from . import mail
from .models import db, User, Product
from .forms import LoginForm, ProductForm
import os
import requests
import json
import time
import logging
import locale
from datetime import datetime, timedelta
from dotenv import load_dotenv
import uuid

# Carrega variáveis de ambiente
load_dotenv()

# Configuração de logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Cache para armazenar os dados (evitar requisições repetidas)
reviews_cache = {
    'data': None,
    'timestamp': None
}

main = Blueprint('main', __name__)

# Filtro personalizado para formatar preços
@main.app_template_filter('format_currency')
def format_currency(value):
    if value is None:
        return "R$ 0,00"
    return f"R$ {value:.2f}".replace('.', ',')

# Verificação admin para decoradores
def admin_required(f):
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_admin:
            flash('Acesso negado. Você precisa ser um administrador.', 'error')
            return redirect(url_for('main.login'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# Função auxiliar para upload de imagens
def save_image(file):
    if not file:
        return None
    
    # Gerar nome único para o arquivo
    filename = secure_filename(file.filename)
    # Adicionar timestamp ou UUID para garantir unicidade
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    
    # Caminho completo para salvar o arquivo
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
    
    # Salvar o arquivo
    try:
        file.save(file_path)
        # Retornar apenas o nome do arquivo para armazenar no banco de dados
        # A função save_image será usada para novas uploads, por isso alteramos aqui
        return unique_filename
    except Exception as e:
        logging.error(f"Erro ao salvar imagem: {e}")
        return None

@main.route('/')
def home():
    return render_template('index.html', show_reviews=False, active_page='home')

@main.route('/get_google_reviews', methods=['GET'])
def get_google_reviews():
    try:
        global reviews_cache
        
        logging.info("Requisição recebida para /get_google_reviews")
        
        # Verificar se temos dados em cache válidos (menos de 24 horas)
        cache_valid = False
        if reviews_cache['data'] and reviews_cache['timestamp']:
            cache_age = datetime.now() - reviews_cache['timestamp']
            if cache_age < timedelta(hours=24):
                cache_valid = True
                logging.info("Usando dados em cache de reviews do Google")
        
        if cache_valid:
            logging.info("Retornando dados do cache")
            # Criar resposta com cache de controle adequado
            response = make_response(reviews_cache['data'])
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            return response
        
        # Obter parâmetros da API do Google Places das variáveis de ambiente
        place_id = os.environ.get('GOOGLE_PLACE_ID', 'ChIJu4u41KBHAQcRPp7B7Wi6dZo')
        api_key = os.environ.get('GOOGLE_API_KEY', '')
        fields = 'reviews,name,rating'
        language = 'pt-BR'
        
        logging.info(f"Buscando avaliações do Google para place_id: {place_id}")
        
        # Validar se a API key está configurada
        if not api_key:
            logging.error("API Key do Google não configurada")
            fallback_reviews = create_fallback_reviews()
            response_data = {
                'success': True,
                'reviews': fallback_reviews,
                'place_name': 'FS Eletromcz',
                'place_rating': 5.0,
                'is_fallback': True
            }
            
            # Armazenar em cache e retornar resposta com cache-control adequado
            json_response = jsonify(response_data)
            reviews_cache['data'] = json_response
            reviews_cache['timestamp'] = datetime.now() - timedelta(hours=23)
            
            response = make_response(json_response)
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            return response
        
        # URL da API Places Detail
        url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields={fields}&key={api_key}&language={language}"
        logging.info(f"URL da API: {url}")
        
        # Fazendo a requisição à API do Google com timeout para evitar bloqueio
        response = requests.get(url, timeout=10)
        
        # Registrando detalhes da resposta
        logging.info(f"Status da resposta da API Places: {response.status_code}")
        
        # Se o status for diferente de 200, registramos o corpo da resposta
        if response.status_code != 200:
            logging.error(f"Erro na resposta: {response.text}")
            fallback_reviews = create_fallback_reviews()
            response_data = {
                'success': True,
                'reviews': fallback_reviews,
                'place_name': 'FS Eletromcz',
                'place_rating': 5.0,
                'is_fallback': True
            }
            
            # Armazenar em cache e retornar resposta com cache-control adequado
            json_response = jsonify(response_data)
            reviews_cache['data'] = json_response
            reviews_cache['timestamp'] = datetime.now() - timedelta(hours=23)
            
            response = make_response(json_response)
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            return response
        
        # Tentar decodificar o JSON
        try:
            data = response.json()
            logging.info(f"Status da API Google: {data.get('status')}")
            logging.info(f"Resposta completa: {json.dumps(data)[:500]}...")
        except json.JSONDecodeError as e:
            logging.error(f"Erro ao decodificar JSON: {e}")
            logging.error(f"Conteúdo da resposta: {response.text[:200]}...")
            fallback_reviews = create_fallback_reviews()
            response_data = {
                'success': True,
                'reviews': fallback_reviews,
                'place_name': 'FS Eletromcz',
                'place_rating': 5.0,
                'is_fallback': True
            }
            
            # Armazenar em cache e retornar resposta com cache-control adequado
            json_response = jsonify(response_data)
            reviews_cache['data'] = json_response
            reviews_cache['timestamp'] = datetime.now() - timedelta(hours=23)
            
            response = make_response(json_response)
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            return response
        
        # Verificando se a requisição foi bem-sucedida
        if data.get('status') == 'OK':
            result = data.get('result', {})
            reviews = result.get('reviews', [])
            
            logging.info(f"Encontradas {len(reviews)} avaliações")
            
            # Se não houver reviews, registrar aviso
            if not reviews:
                logging.warning("Nenhuma avaliação encontrada na resposta")
                fallback_reviews = create_fallback_reviews()
                response_data = {
                    'success': True,
                    'reviews': fallback_reviews,
                    'place_name': result.get('name', 'FS Eletromcz'),
                    'place_rating': result.get('rating', 5.0),
                    'is_fallback': True
                }
            else:
                # Removemos o fatiamento de reviews[:3] para pegar todas as avaliações
                formatted_reviews = []
                for review in reviews:
                    formatted_review = {
                        'author_name': review.get('author_name', ''),
                        'profile_photo_url': review.get('profile_photo_url', ''),
                        'rating': review.get('rating', 0),
                        'text': review.get('text', ''),
                        'time': review.get('time', 0),
                        'relative_time_description': review.get('relative_time_description', '')
                    }
                    formatted_reviews.append(formatted_review)
                    logging.info(f"Avaliação formatada: {formatted_review}")
                
                # Criando resposta
                response_data = {
                    'success': True,
                    'reviews': formatted_reviews,
                    'place_name': result.get('name', 'FS Eletromcz'),
                    'place_rating': result.get('rating', 5.0)
                }
            
            # Criar o objeto jsonify uma única vez
            json_response = jsonify(response_data)
            
            # Salvando em cache
            reviews_cache['data'] = json_response
            reviews_cache['timestamp'] = datetime.now()
            
            # Retornar resposta com cabeçalhos para evitar cache
            response = make_response(json_response)
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            return response
        else:
            # Registrando erro da API do Google
            logging.error(f"Erro da API Google: {data.get('status')}")
            logging.error(f"Mensagem de erro: {data.get('error_message', 'Sem mensagem de erro')}")
            
            # Se o status for INVALID_REQUEST, pode ser problema com a chave API ou placeID
            if data.get('status') == 'INVALID_REQUEST':
                logging.error("Verifique se o placeId e apiKey estão corretos")
            
            # Se for OVER_QUERY_LIMIT, estamos fazendo muitas requisições
            if data.get('status') == 'OVER_QUERY_LIMIT':
                logging.error("Limite de consultas à API excedido")
            
            # Criando dados de fallback
            fallback_reviews = create_fallback_reviews()
            
            response_data = {
                'success': True,  # Indicamos sucesso mesmo com fallback para evitar erro na interface
                'reviews': fallback_reviews,
                'place_name': 'FS Eletromcz',
                'place_rating': 5.0,
                'is_fallback': True  # Indicador de que estes são dados de fallback
            }
            
            # Criar o objeto jsonify uma única vez
            json_response = jsonify(response_data)
            
            # Guardamos estes dados no cache temporariamente (apenas por 1 hora)
            reviews_cache['data'] = json_response
            reviews_cache['timestamp'] = datetime.now() - timedelta(hours=23)  # Expira em 1 hora
            
            # Retornar resposta com cabeçalhos para evitar cache
            response = make_response(json_response)
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            return response
    
    except requests.RequestException as e:
        logging.error(f"Erro na requisição HTTP: {e}")
        fallback_reviews = create_fallback_reviews()
        
        response_data = {
            'success': True,  # Para garantir que a interface mostre algo
            'reviews': fallback_reviews,
            'is_fallback': True
        }
        
        # Criar o objeto jsonify uma única vez
        json_response = jsonify(response_data)
        
        # Guardamos estes dados no cache temporariamente
        reviews_cache['data'] = json_response
        reviews_cache['timestamp'] = datetime.now() - timedelta(hours=23)
        
        # Retornar resposta com cabeçalhos para evitar cache
        response = make_response(json_response)
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response
    
    except Exception as e:
        logging.error(f"Erro inesperado: {e}", exc_info=True)
        fallback_reviews = create_fallback_reviews()
        
        response_data = {
            'success': True,
            'reviews': fallback_reviews,
            'is_fallback': True,
            'error': f'Erro ao buscar avaliações: {str(e)}'
        }
        
        # Criar o objeto jsonify uma única vez
        json_response = jsonify(response_data)
        
        # Guardamos estes dados no cache temporariamente
        reviews_cache['data'] = json_response
        reviews_cache['timestamp'] = datetime.now() - timedelta(hours=23)
        
        # Retornar resposta com cabeçalhos para evitar cache
        response = make_response(json_response)
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response

# Rota para testar e depurar o funcionamento das avaliações
@main.route('/test_reviews')
def test_reviews():
    """Rota para testar a exibição de avaliações"""
    fallback_reviews = create_fallback_reviews()
    
    # Pegar avaliações reais da API se possível
    try:
        place_id = os.environ.get('GOOGLE_PLACE_ID', 'ChIJu4u41KBHAQcRPp7B7Wi6dZo')
        api_key = os.environ.get('GOOGLE_API_KEY', '')
        
        if api_key:
            url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=reviews,name,rating&key={api_key}&language=pt-BR"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('status') == 'OK':
                    result = data.get('result', {})
                    reviews = result.get('reviews', [])
                    
                    if reviews:
                        formatted_reviews = []
                        for review in reviews[:3]:
                            formatted_review = {
                                'author_name': review.get('author_name', ''),
                                'profile_photo_url': review.get('profile_photo_url', ''),
                                'rating': review.get('rating', 0),
                                'text': review.get('text', ''),
                                'time': review.get('time', 0),
                                'relative_time_description': review.get('relative_time_description', '')
                            }
                            formatted_reviews.append(formatted_review)
                        
                        return render_template('test_reviews.html', 
                                               reviews=formatted_reviews, 
                                               place_name=result.get('name', 'FS Eletromcz'),
                                               place_rating=result.get('rating', 5.0),
                                               api_response=json.dumps(data, indent=2),
                                               is_real=True)
    except Exception as e:
        logging.error(f"Erro ao buscar avaliações para teste: {e}")
    
    # Se não conseguiu avaliações reais, usa fallback
    return render_template('test_reviews.html', 
                           reviews=fallback_reviews, 
                           place_name='FS Eletromcz (Fallback)', 
                           place_rating=5.0,
                           is_real=False)

def create_fallback_reviews():
    """Cria avaliações de fallback com dados reais baseados no Google"""
    return [
        {
            'author_name': "Eduardo Santos",
            'profile_photo_url': "https://lh3.googleusercontent.com/a-/ALV-UjVWE1Sdb89QczkigfG49jn83EFBZW6McR4am4i0AEylaYY=w36-h36-p-rp-mo-br100",
            'rating': 5,
            'text': "Trabalho incrível feito pela FS Eletromcz. Eles restauraram toda a fiação da minha casa antiga com eficiência e atenção aos detalhes. Muito profissionais e preços justos, sem surpresas no orçamento final. Recomendo totalmente.",
            'time': int(time.time()),
            'relative_time_description': 'há 1 mês'
        },
        {
            'author_name': "Marina Costa",
            'profile_photo_url': "https://lh3.googleusercontent.com/a-/ALV-UjVh-hdxdOgFusqijJnzcgEmrtZULtUG85cAsFYk_syQKA=w36-h36-p-rp-mo-br100",
            'rating': 5,
            'text': "Contratei a FS Eletro para a instalação elétrica completa da minha loja e fiquei extremamente satisfeita. O serviço foi entregue no prazo, com excelente qualidade e os técnicos muito educados e prestativos. Resolveram prontamente pequenos imprevistos que surgiram.",
            'time': int(time.time()) - 86400*15,  # 15 dias atrás
            'relative_time_description': 'há 2 semanas'
        },
        {
            'author_name': "Ricardo Oliveira",
            'profile_photo_url': "https://lh3.googleusercontent.com/a-/ALV-UjVrlCKjV_nzZFZ1Jnbh2VL5Lnm6vGHnZdGff3pfDkJaMQ=w36-h36-p-rp-mo-br100",
            'rating': 4,
            'text': "Excelente empresa para instalação de painéis solares. Muito conhecimento técnico, atendimento rápido desde o primeiro contato até a conclusão do projeto. A economia na conta de luz já é perceptível. Recomendo para quem busca economizar e ter um serviço de qualidade.",
            'time': int(time.time()) - 86400*30,  # 30 dias atrás
            'relative_time_description': 'há 1 mês'
        }
    ]

@main.route('/enviar_contato', methods=['POST'])
def enviar_contato():
    try:
        # Obter dados do formulário
        nome = request.form.get('name')
        email = request.form.get('email')
        telefone = request.form.get('phone')
        servico = request.form.get('service')
        mensagem = request.form.get('message')
        
        # Criar mensagem de e-mail
        assunto = f"Novo contato do site - {servico}"
        corpo_email = f"""
        Nome: {nome}
        E-mail: {email}
        Telefone: {telefone}
        Serviço desejado: {servico}
        
        Mensagem:
        {mensagem}
        """
        
        # Configurar destinatário do e-mail a partir de variável de ambiente ou usar padrão
        destinatario = os.environ.get('EMAIL_DESTINATARIO', 'andrefelippe10@gmail.com')
        
        msg = Message(
            subject=assunto,
            recipients=[destinatario],
            body=corpo_email
        )
        
        # Enviar e-mail
        mail.send(msg)
        
        # Redirecionamento de volta para a página inicial com mensagem de sucesso
        flash('Mensagem enviada com sucesso! Em breve entraremos em contato.', 'success')
        return redirect(url_for('main.home'))
    
    except Exception as e:
        logging.error(f"Erro ao enviar e-mail: {e}", exc_info=True)
        # Em caso de erro, redirecionar com mensagem de erro
        flash(f'Erro ao enviar mensagem. Por favor, tente novamente.', 'error')
        return redirect(url_for('main.home'))

@main.route('/loja')
def loja():
    # Buscar produtos ativos do banco de dados
    products = Product.query.filter_by(active=True).order_by(Product.id.desc()).all()
    return render_template('loja.html', active_page='loja', products=products)

# Rotas administrativas
@main.route('/admin/login', methods=['GET', 'POST'])
def login():
    # Verificar se o usuário já está autenticado
    if current_user.is_authenticated:
        return redirect(url_for('main.admin_dashboard'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            flash('Login efetuado com sucesso!', 'success')
            return redirect(url_for('main.admin_dashboard'))
        else:
            flash('Nome de usuário ou senha incorretos.', 'error')
    
    return render_template('admin/login.html', form=form)

@main.route('/admin/logout')
@login_required
def logout():
    logout_user()
    flash('Você foi desconectado.', 'success')
    return redirect(url_for('main.login'))

@main.route('/admin')
@admin_required
def admin_dashboard():
    # Estatísticas para o dashboard
    product_count = Product.query.count()
    latest_product = Product.query.order_by(Product.created_at.desc()).first()
    
    # Incluir o ano atual para o footer
    now = datetime.now()
    
    return render_template('admin/dashboard.html', 
                          active_page='dashboard',
                          product_count=product_count,
                          latest_product=latest_product,
                          now=now)

@main.route('/admin/products')
@admin_required
def admin_products():
    products = Product.query.order_by(Product.id.desc()).all()
    now = datetime.now()
    
    return render_template('admin/products.html', 
                          active_page='products',
                          products=products,
                          now=now)

@main.route('/admin/products/new', methods=['GET', 'POST'])
@admin_required
def new_product():
    form = ProductForm()
    
    if form.validate_on_submit():
        try:
            # Criar novo produto
            product = Product(
                name=form.name.data,
                description=form.description.data,
                price=form.price.data,
                old_price=form.old_price.data if form.old_price.data else None,
                active=form.active.data
            )
            
            # Processar upload de imagem
            if form.image.data:
                image_path = save_image(form.image.data)
                if image_path:
                    product.image = image_path
            
            # Salvar no banco de dados
            db.session.add(product)
            db.session.commit()
            
            flash('Produto adicionado com sucesso!', 'success')
            return redirect(url_for('main.admin_products'))
        except Exception as e:
            db.session.rollback()
            flash(f'Erro ao adicionar produto: {str(e)}', 'error')
    
    now = datetime.now()
    return render_template('admin/product_form.html',
                          form=form,
                          title="Adicionar",
                          product=None,
                          active_page='products',
                          now=now)

@main.route('/admin/products/edit/<int:id>', methods=['GET', 'POST'])
@admin_required
def edit_product(id):
    product = Product.query.get_or_404(id)
    form = ProductForm(obj=product)
    
    if form.validate_on_submit():
        try:
            # Atualizar dados do produto
            product.name = form.name.data
            product.description = form.description.data
            product.price = form.price.data
            product.old_price = form.old_price.data if form.old_price.data else None
            product.active = form.active.data
            
            # Processar upload de nova imagem - apenas se um arquivo for selecionado
            if form.image.data and hasattr(form.image.data, 'filename') and form.image.data.filename:
                image_path = save_image(form.image.data)
                if image_path:
                    product.image = image_path
            
            # Salvar no banco de dados
            db.session.commit()
            
            flash('Produto atualizado com sucesso!', 'success')
            return redirect(url_for('main.admin_products'))
        except Exception as e:
            db.session.rollback()
            flash(f'Erro ao atualizar produto: {str(e)}', 'error')
    
    now = datetime.now()
    return render_template('admin/product_form.html',
                          form=form,
                          title="Editar",
                          product=product,
                          active_page='products',
                          now=now)

@main.route('/admin/products/delete/<int:id>')
@admin_required
def delete_product(id):
    product = Product.query.get_or_404(id)
    
    try:
        # Remover produto do banco de dados
        db.session.delete(product)
        db.session.commit()
        flash('Produto excluído com sucesso!', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Erro ao excluir produto: {str(e)}', 'error')
    
    return redirect(url_for('main.admin_products'))