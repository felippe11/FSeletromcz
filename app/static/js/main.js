// Função para verificar quando o usuário rola a página
document.addEventListener('DOMContentLoaded', function() {
    // Garante que a largura da página seja ajustada corretamente no mobile
    document.documentElement.style.width = '100%';
    document.body.style.width = '100%';
    document.body.style.overflowX = 'hidden';
    
    // Configuração do menu mobile
    setupMobileMenu();
    
    // Efeito de scroll na barra de navegação
    setupScrollHeader();
    
    // Animações ao rolar
    setupScrollAnimations();
    
    // Smooth scroll para links internos
    setupSmoothScroll();
    
    // Efeito parallax na seção CTA
    setupParallaxEffect();
    
    // Forçar recálculo de layout no carregamento para evitar overflow no index
    setTimeout(function() {
        window.dispatchEvent(new Event('resize'));
    }, 100);
});

// Configuração do menu mobile - VERSÃO CORRIGIDA
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMenuButton = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    // Verificações de debug
    if (!mobileMenuButton) console.error('Botão do menu mobile não encontrado');
    if (!closeMenuButton) console.error('Botão de fechar não encontrado');
    if (!mobileMenu) console.error('Menu mobile não encontrado');
    if (!mobileMenuOverlay) console.error('Overlay do menu não encontrado');
    
    // Só procede se todos os elementos existirem
    if (mobileMenuButton && closeMenuButton && mobileMenu && mobileMenuOverlay) {
        console.log('Elementos do menu mobile encontrados');
        
        // Função para abrir o menu com debug
        function openMenu() {
            console.log('Tentando abrir menu mobile');
            mobileMenu.classList.remove('translate-x-full');
            mobileMenuOverlay.classList.remove('hidden');
            // Pequeno atraso para garantir que o DOM seja atualizado antes da animação
            setTimeout(() => {
                mobileMenuOverlay.classList.remove('opacity-0');
            }, 10);
            document.body.classList.add('overflow-hidden'); // Impede rolagem
            console.log('Menu mobile deve estar aberto agora');
        }
        
        // Função para fechar o menu com debug
        function closeMenu() {
            console.log('Tentando fechar menu mobile');
            mobileMenu.classList.add('translate-x-full');
            mobileMenuOverlay.classList.add('opacity-0');
            // Aguarda a conclusão da animação antes de ocultar completamente
            setTimeout(() => {
                mobileMenuOverlay.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }, 300);
            console.log('Menu mobile deve estar fechado agora');
        }
        
        // Adiciona eventos de clique com log
        mobileMenuButton.addEventListener('click', function(e) {
            console.log('Botão menu mobile clicado');
            e.preventDefault();
            openMenu();
        });
        
        closeMenuButton.addEventListener('click', function(e) {
            console.log('Botão fechar menu clicado');
            e.preventDefault();
            closeMenu();
        });
        
        mobileMenuOverlay.addEventListener('click', function(e) {
            console.log('Overlay clicado');
            e.preventDefault();
            closeMenu();
        });
        
        // Fecha o menu ao clicar em links
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                console.log('Link do menu mobile clicado');
                closeMenu();
            });
        });
        
        // Fecha o menu se a janela for redimensionada para desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768) { // 768px é o breakpoint md do Tailwind
                closeMenu();
            }
        });
    }
}

// Efeito de header com scroll
function setupScrollHeader() {
    const header = document.querySelector('header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        });
    }
}

// Animações ao rolar a página
function setupScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    if (fadeElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = 1;
                }
            });
        }, { threshold: 0.1 });
        
        fadeElements.forEach(el => {
            el.style.opacity = 0;
            observer.observe(el);
        });
    }
}

// Configuração de rolagem suave para links internos
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Compensar a altura do cabeçalho fixo
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Detectar tamanho de tela para ajustar elementos específicos
function checkScreenSize() {
    const width = window.innerWidth;
    
    // Ajustar elementos específicos com base no tamanho da tela
    if (width < 768) {
        // Ajustes para dispositivos móveis
        document.querySelectorAll('.desktop-only').forEach(el => {
            el.style.display = 'none';
        });
    } else {
        // Ajustes para desktop
        document.querySelectorAll('.desktop-only').forEach(el => {
            el.style.display = 'block';
        });
    }
}

// Efeito parallax na seção CTA
function setupParallaxEffect() {
    // Selecionar a seção CTA
    const ctaSection = document.querySelector('section.bg-cover.bg-fixed');
    
    if (ctaSection) {
        // Adicionar classe para efeito parallax
        ctaSection.classList.add('bg-parallax');
        
        // Criar efeito de movimento suave ao rolar
        window.addEventListener('scroll', function() {
            // Calcula a posição relativa para o efeito parallax
            const scrollPosition = window.pageYOffset;
            const sectionPosition = ctaSection.offsetTop;
            const sectionHeight = ctaSection.offsetHeight;
            
            // Verificar se a seção está visível na viewport
            if (scrollPosition + window.innerHeight > sectionPosition && 
                scrollPosition < sectionPosition + sectionHeight) {
                
                // Calcular o deslocamento para o efeito parallax
                const yPos = (scrollPosition - sectionPosition) * 0.3;
                
                // Aplicar transformação suave
                ctaSection.style.backgroundPosition = `center ${-yPos}px`;
            }
        });
    }
}

// Executar ao carregar e redimensionar a janela
window.addEventListener('load', checkScreenSize);
window.addEventListener('resize', checkScreenSize);