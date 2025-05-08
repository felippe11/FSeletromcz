// FAQ.js - Script para animações e interações na seção de perguntas frequentes (FAQ)
// Este script adiciona animações e interações aos elementos FAQ, como abrir/fechar respostas e animações de ícones.
    document.addEventListener('DOMContentLoaded', function() {
        // Adicionar eventos de clique aos botões de perguntas
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                // Obtenha o contêiner da resposta associado a esta pergunta
                const answer = this.parentElement.querySelector('.faq-answer');
                const arrowIcon = this.querySelector('.faq-arrow-icon');
                const faqCard = this.closest('.faq-card');
                
                // Alternar a visibilidade da resposta
                if (answer.classList.contains('hidden')) {
                    // Fechar todas as respostas abertas antes de abrir esta
                    document.querySelectorAll('.faq-answer').forEach(item => {
                        if (!item.classList.contains('hidden')) {
                            // Animar fechamento
                            const card = item.closest('.faq-card');
                            const arrow = item.previousElementSibling.querySelector('.faq-arrow-icon');
                            
                            // Reset das classes de estilo
                            card.classList.remove('active-faq-card');
                            arrow.classList.remove('rotate-180');
                            
                            // Esconder com atraso para permitir animação
                            item.classList.add('closing');
                            setTimeout(() => {
                                item.classList.add('hidden');
                                item.classList.remove('closing');
                            }, 300);
                        }
                    });
                    
                    // Abrir esta resposta com animação
                    answer.classList.remove('hidden');
                    arrowIcon.classList.add('rotate-180');
                    faqCard.classList.add('active-faq-card');
                    
                    // Pequena animação de pulso no ícone
                    const icon = this.querySelector('.faq-icon');
                    icon.classList.add('pulse-once');
                    setTimeout(() => {
                        icon.classList.remove('pulse-once');
                    }, 500);
                    
                } else {
                    // Fechar esta resposta com animação
                    arrowIcon.classList.remove('rotate-180');
                    faqCard.classList.remove('active-faq-card');
                    
                    answer.classList.add('closing');
                    setTimeout(() => {
                        answer.classList.add('hidden');
                        answer.classList.remove('closing');
                    }, 300);
                }
            });
        });
        
        // Adicionar evento de hover para animação nos ícones
        document.querySelectorAll('.faq-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                const icon = this.querySelector('.faq-icon');
                icon.classList.add('icon-hover');
            });
            
            card.addEventListener('mouseleave', function() {
                const icon = this.querySelector('.faq-icon');
                icon.classList.remove('icon-hover');
            });
        });
    });