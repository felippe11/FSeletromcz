// Script para animar o indicador de swipe em dispositivos móveis
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos em um dispositivo móvel
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        // Encontrar o indicador de swipe
        const swipeIndicator = document.querySelector('.swipe-indicator');
        
        if (swipeIndicator) {
            // Adicionar animação para demonstrar o movimento de swipe
            setTimeout(() => {
                // Animação sutil para mostrar o gesto de swipe
                swipeIndicator.style.transition = 'transform 0.8s ease-in-out';
                
                // Alternar entre movimento para esquerda e direita
                let direction = 'right';
                
                const animateSwipe = () => {
                    if (direction === 'right') {
                        swipeIndicator.style.transform = 'translateX(10px)';
                        direction = 'left';
                    } else {
                        swipeIndicator.style.transform = 'translateX(-10px)';
                        direction = 'right';
                    }
                };
                
                // Iniciar a animação e repetir algumas vezes
                let count = 0;
                const maxAnimations = 3;
                
                const swipeAnimation = setInterval(() => {
                    animateSwipe();
                    count++;
                    
                    if (count >= maxAnimations * 2) { // *2 porque cada ciclo tem dois estados
                        clearInterval(swipeAnimation);
                        swipeIndicator.style.transform = 'translateX(0)'; // Resetar posição
                    }
                }, 800);
                
                // Ocultar o indicador após interagir com o carrossel
                const testimonialCarousel = document.getElementById('testimonials-carousel');
                if (testimonialCarousel) {
                    testimonialCarousel.addEventListener('touchstart', () => {
                        swipeIndicator.style.opacity = '0';
                        setTimeout(() => {
                            swipeIndicator.style.display = 'none';
                        }, 500);
                    }, { once: true });
                }
            }, 2000); // Atraso para começar a animação
        }
    }
});
