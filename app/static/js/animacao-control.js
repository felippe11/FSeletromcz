        // Script para animações baseadas em scroll
        document.addEventListener('DOMContentLoaded', function() {
            // Seleciona todos os elementos com classes de animação
            const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .slide-right, .slide-left');
            
            // Configura o Intersection Observer para detectar quando os elementos entram no viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Se o elemento tiver um delay definido, respeitamos este delay
                        if (entry.target.style.animationDelay) {
                            // Convertemos o delay definido no CSS para timeout do JavaScript
                            const delayMatch = entry.target.style.animationDelay.match(/[\d\.]+/);
                            if (delayMatch) {
                                const delaySeconds = parseFloat(delayMatch[0]);
                                setTimeout(() => {
                                    entry.target.classList.add('animated');
                                }, delaySeconds * 1000);
                            }
                        } else {
                            // Se não tiver delay, anima imediatamente
                            entry.target.classList.add('animated');
                        }
                        
                        // Uma vez que o elemento já foi animado ou programado para animar, não precisamos mais observá-lo
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1, // O elemento precisa estar 10% visível antes de iniciar a animação
                rootMargin: '0px 0px -100px 0px' // Inicia a animação um pouco antes do elemento entrar totalmente na tela
            });
            
            // Começa a observar todos os elementos animados
            animatedElements.forEach(el => {
                observer.observe(el);
            });
            
            // Smooth scrolling para links de âncora
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    
                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            });

            // Toggle do menu mobile
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');

            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
            
            // Botão Whatsapp continua com animação constante
            const whatsappButton = document.querySelector('.fixed.bottom-6.right-6');
            if (whatsappButton) {
                whatsappButton.classList.add('pulse');
            }
        });