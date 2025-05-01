from flask import Blueprint, render_template, request, flash, redirect, url_for
from flask_mail import Message
from . import mail
import os

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return render_template('index.html')

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
        
        msg = Message(
            subject=assunto,
            recipients=["andrefelippe10@gmail.com"],
            body=corpo_email
        )
        
        # Enviar e-mail
        mail.send(msg)
        
        # Redirecionamento de volta para a página inicial com mensagem de sucesso
        flash('Mensagem enviada com sucesso! Em breve entraremos em contato.', 'success')
        return redirect(url_for('main.home'))
    
    except Exception as e:
        # Em caso de erro, redirecionar com mensagem de erro
        flash(f'Erro ao enviar mensagem. Por favor, tente novamente.', 'error')
        return redirect(url_for('main.home'))