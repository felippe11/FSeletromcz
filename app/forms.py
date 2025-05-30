from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, TextAreaField, PasswordField, SubmitField, FloatField, BooleanField
from wtforms.validators import DataRequired, Length, Email, NumberRange, Optional
from wtforms import widgets
import decimal

class DecimalField(FloatField):
    """
    Campo customizado que aceita vírgula como separador decimal para valores em reais
    """
    def process_formdata(self, valuelist):
        if valuelist:
            try:
                # Substitui a vírgula por ponto para o Python processar corretamente
                self.data = float(valuelist[0].replace(',', '.'))
            except ValueError:
                self.data = None
                raise ValueError('Valor inválido para preço')

class LoginForm(FlaskForm):
    username = StringField('Nome de usuário', validators=[DataRequired()])
    password = PasswordField('Senha', validators=[DataRequired()])
    submit = SubmitField('Entrar')

class ProfileForm(FlaskForm):
    username = StringField('Nome de usuário', validators=[
        DataRequired(), 
        Length(min=3, max=64),
        # Garantir que só tenha caracteres alfanuméricos e underscores
        # Regex para permitir letras, números e underscores
        # Regexp('^[A-Za-z0-9_]+$', message="Nome de usuário deve conter apenas letras, números e _")
    ])
    current_password = PasswordField('Senha atual', validators=[DataRequired()])
    new_password = PasswordField('Nova senha', validators=[Optional(), Length(min=6, message="A nova senha deve ter pelo menos 6 caracteres")])
    confirm_password = PasswordField('Confirmar nova senha', validators=[Optional()])
    submit = SubmitField('Salvar alterações')
    
    def validate_confirm_password(self, field):
        if self.new_password.data and self.new_password.data != field.data:
            raise ValueError('As senhas não coincidem')

class ProductForm(FlaskForm):
    name = StringField('Nome do Produto', validators=[DataRequired(), Length(min=2, max=100)])
    description = TextAreaField('Descrição', validators=[DataRequired()])
    price = DecimalField('Preço (R$)', validators=[DataRequired(), NumberRange(min=0)])
    old_price = DecimalField('Preço Antigo (R$)', validators=[Optional(), NumberRange(min=0)])
    image = FileField('Imagem do Produto', validators=[FileAllowed(['jpg', 'jpeg', 'png'], 'Apenas imagens!')])
    active = BooleanField('Produto Ativo', default=True)
    submit = SubmitField('Salvar')

class BlogPostForm(FlaskForm):
    title = StringField('Título', validators=[DataRequired(), Length(min=3, max=200)])
    slug = StringField('URL amigável', validators=[DataRequired(), Length(min=3, max=200)])
    summary = TextAreaField('Resumo', validators=[Length(max=300)])
    content = TextAreaField('Conteúdo', validators=[DataRequired()])
    featured_image = FileField('Imagem Destacada', validators=[FileAllowed(['jpg', 'jpeg', 'png'], 'Apenas imagens!')])
    published = BooleanField('Publicar', default=True)
    submit = SubmitField('Salvar')