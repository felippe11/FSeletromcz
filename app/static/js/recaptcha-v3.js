document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('form[action="/enviar_contato"]');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Executar o reCAPTCHA quando o formulário for enviado
            grecaptcha.ready(function() {
                // Substituir 'formsubmit' pela ação que você está executando
                grecaptcha.execute('6LeYwk0rAAAAABabDvT2fDJmy4xo8SqSEkNGxnh9', {action: 'formsubmit'})
                    .then(function(token) {
                        // Adicionar o token ao campo oculto
                        document.getElementById('recaptchaResponse').value = token;
                        
                        // Enviar o formulário
                        contactForm.submit();
                    });
            });
        });
    }
});
