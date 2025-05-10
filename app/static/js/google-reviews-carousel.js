document.addEventListener('DOMContentLoaded', function() {
    console.log("Script de carrossel de avaliações carregado!");
    
    // Elementos principais
    const loadingIndicator = document.getElementById('loading-indicator');
    const testimonialsCarousel = document.getElementById('testimonials-carousel');
    const swiperWrapper = testimonialsCarousel ? testimonialsCarousel.querySelector('.swiper-wrapper') : null;
    const moreReviewsButton = document.getElementById('more-reviews-button');
    const googleReviewsLink = document.getElementById('google-reviews-link');
    
    // Verificar se todos os elementos existem
    if (!loadingIndicator || !testimonialsCarousel || !swiperWrapper || !moreReviewsButton || !googleReviewsLink) {
        console.error("Elementos necessários não encontrados!");
        return;
    }
    
    // Configurar o link para a página do Google Reviews
    const placeId = 'ChIJu4u41KBHAQcRPp7B7Wi6dZo';
    googleReviewsLink.href = `https://search.google.com/local/reviews?placeid=${placeId}`;
    
    // Função para inicializar o carrossel Swiper após o carregamento dos dados
    function initSwiper() {
        console.log("Inicializando Swiper...");
        
        // Mostrar o carrossel (estava escondido durante o carregamento)
        testimonialsCarousel.classList.remove('hidden');
        
        // Inicializar o Swiper com efeito 3D
        const swiper = new Swiper('#testimonials-carousel', {        effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            touchEventsTarget: 'container',
            touchRatio: 1,
            touchAngle: 45,
            simulateTouch: true,
            coverflowEffect: {
                rotate: 5,
                stretch: 0,
                depth: 100,
                modifier: 2,
                slideShadows: true,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {            // mobile - navegação por toque/swipe
                320: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                    navigation: {
                        enabled: false
                    },
                    allowTouchMove: true
                },
                // tablet
                640: {
                    slidesPerView: 2,
                    spaceBetween: 30
                },
                // desktop
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 40
                }
            }
        });
        
        console.log("Swiper inicializado com sucesso!");
    }
    
    // Função para carregar as avaliações via API
    function loadGoogleReviews() {
        console.log("Carregando avaliações do Google...");
        
        // Adicionar parâmetro para evitar cache
        const timestamp = new Date().getTime();
        const url = `/get_google_reviews?_=${timestamp}`;
        
        fetch(url, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        })
        .then(response => {
            console.log("Resposta recebida:", response.status);
            if (!response.ok) {
                throw new Error(`Resposta do servidor não OK: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Dados recebidos:", data);
            
            // Remover indicador de carregamento
            loadingIndicator.remove();
            
            // Verificar se temos avaliações para mostrar
            if (data.success && data.reviews && data.reviews.length > 0) {
                // Exibir botão para mais avaliações
                moreReviewsButton.classList.remove('hidden');
                
                // Se estamos usando dados de fallback, mostrar indicador sutil
                if (data.is_fallback) {
                    console.log("Usando dados de fallback");
                    const fallbackNote = document.createElement('div');
                    fallbackNote.className = 'text-center text-sm text-gray-500 mb-4';
                    fallbackNote.innerHTML = 'Mostrando avaliações locais. Atualize a página para tentar novamente.';
                    testimonialsCarousel.insertAdjacentElement('beforebegin', fallbackNote);
                }
                
                // Criar slides para cada avaliação
                data.reviews.forEach(review => {
                    // Criar as estrelas baseado na avaliação
                    let starsHTML = '';
                    for (let i = 1; i <= 5; i++) {
                        if (i <= review.rating) {
                            starsHTML += '<i class="fas fa-star text-yellow-500"></i>';
                        } else if (i - 0.5 <= review.rating) {
                            starsHTML += '<i class="fas fa-star-half-alt text-yellow-500"></i>';
                        } else {
                            starsHTML += '<i class="far fa-star text-yellow-500"></i>';
                        }
                    }
                    
                    // Limitar o tamanho do texto para exibição
                    const maxLength = 200;
                    let reviewText = review.text || '';
                    if (reviewText.length > maxLength) {
                        reviewText = reviewText.substring(0, maxLength) + '...';
                    }
                    
                    // Criar slide
                    const slide = document.createElement('div');
                    slide.className = 'swiper-slide bg-white rounded-xl shadow-lg p-6 h-auto';
                    slide.innerHTML = `
                        <div class="flex items-center mb-4">
                            <div class="text-yellow-400 mr-2">
                                ${starsHTML}
                            </div>
                            <div class="text-gray-500 text-sm ml-auto">
                                ${review.relative_time_description || ''}
                            </div>
                        </div>
                        <div class="min-h-[120px] mb-6">
                            <p class="text-gray-600">"${reviewText}"</p>
                        </div>
                        <div class="flex items-center mt-auto">
                            <div class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                                <img src="${review.profile_photo_url || ''}" alt="${review.author_name || 'Cliente'}" 
                                    class="w-full h-full object-cover" 
                                    onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(review.author_name || 'Cliente')}&background=random'">
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800">${review.author_name || 'Cliente'}</h4>
                            </div>
                        </div>
                    `;
                    
                    swiperWrapper.appendChild(slide);
                });
                
                // Inicializar o carrossel
                initSwiper();
            } else {
                // Se não há avaliações, mostrar mensagem
                showErrorMessage("Não foi possível carregar avaliações.");
            }
        })
        .catch(error => {
            console.error("Erro ao carregar avaliações:", error);
            loadingIndicator.remove();
            
            // Mostrar mensagem de erro
            showErrorMessage("Ocorreu um erro ao carregar as avaliações. Por favor, tente novamente.");
        });
    }
    
    // Função para exibir mensagem de erro
    function showErrorMessage(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'bg-gray-50 rounded-xl p-8 shadow-md text-center';
        errorEl.innerHTML = `
            <div class="mb-4 text-red-500">
                <i class="fas fa-exclamation-circle text-2xl"></i>
            </div>
            <p class="text-gray-700 mb-4">${message}</p>
            <button id="retry-button" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                <i class="fas fa-redo mr-2"></i> Tentar novamente
            </button>
        `;
        
        // Adicionar ao container do carrossel
        document.querySelector('.testimonial-carousel-container').appendChild(errorEl);
        
        // Adicionar evento para o botão de tentar novamente
        document.getElementById('retry-button').addEventListener('click', function() {
            // Remover a mensagem de erro
            errorEl.remove();
            
            // Adicionar indicador de carregamento novamente
            const newLoader = document.createElement('div');
            newLoader.id = 'loading-indicator';
            newLoader.className = 'bg-gray-50 rounded-xl p-8 shadow-md fade-in text-center';
            newLoader.innerHTML = `
                <div class="flex items-center justify-center mb-4">
                    <i class="fas fa-spinner fa-pulse text-blue-500 text-2xl"></i>
                </div>
                <p class="text-gray-600">Carregando depoimentos reais do Google Reviews...</p>
            `;
            document.querySelector('.testimonial-carousel-container').appendChild(newLoader);
            
            // Limpar slides existentes
            if (swiperWrapper) {
                swiperWrapper.innerHTML = '';
            }
            
            // Esconder o carrossel
            testimonialsCarousel.classList.add('hidden');
            
            // Tentar carregar as avaliações novamente
            setTimeout(loadGoogleReviews, 500);
        });
    }
    
    // Iniciar o carregamento das avaliações
    loadGoogleReviews();
});