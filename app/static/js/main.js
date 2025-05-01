// Função para verificar quando o usuário rola a página
document.addEventListener('DOMContentLoaded', function() {
    // Configuração do menu mobile
    setupMobileMenu();
    
    // Efeito de scroll na barra de navegação
    setupScrollHeader();
    
    // Animações ao rolar
    setupScrollAnimations();
    
    // Smooth scroll para links internos
    setupSmoothScroll();
    
    // Fechar menu mobile ao clicar em um link
    setupMobileMenuClose();
});

// Configuração do menu mobile
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            // Alterna o ícone do botão entre menu e fechar
            const icon = this.querySelector('i');
            if (icon) {
                if (icon.classList.contains('fa-bars')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
}

// Fechar o menu mobile quando um link é clicado
function setupMobileMenuClose() {
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu a');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    if (mobileMenuLinks && mobileMenu && mobileMenuButton) {
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuButton.querySelector('i');
                if (icon && icon.classList.contains('fa-times')) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
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

// Executar ao carregar e redimensionar a janela
window.addEventListener('load', checkScreenSize);
window.addEventListener('resize', checkScreenSize);