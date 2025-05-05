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

class ProductForm(FlaskForm):
    name = StringField('Nome do Produto', validators=[DataRequired(), Length(min=2, max=100)])
    description = TextAreaField('Descrição', validators=[DataRequired()])
    price = DecimalField('Preço (R$)', validators=[DataRequired(), NumberRange(min=0)])
    old_price = DecimalField('Preço Antigo (R$)', validators=[Optional(), NumberRange(min=0)])
    image = FileField('Imagem do Produto', validators=[FileAllowed(['jpg', 'jpeg', 'png'], 'Apenas imagens!')])
    active = BooleanField('Produto Ativo', default=True)
    submit = SubmitField('Salvar')