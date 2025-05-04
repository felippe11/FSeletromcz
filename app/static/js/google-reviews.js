document.addEventListener('DOMContentLoaded', function() {
    console.log("Script de avaliações Google carregado!");
    
    // Função para carregar depoimentos do Google Reviews via backend
    function loadGoogleReviews() {
        console.log("Função loadGoogleReviews iniciada");
        const testimonialsContainer = document.getElementById('testimonials-container');
        const loadingIndicator = document.getElementById('loading-indicator');
        const moreReviewsButton = document.getElementById('more-reviews-button');
        const googleReviewsLink = document.getElementById('google-reviews-link');
        
        if (!testimonialsContainer) {
            console.error("Container de depoimentos não encontrado!");
            return;
        }
        
        console.log("Elementos da DOM encontrados");
        
        // Configurar o link para a página do Google Reviews
        const placeId = 'ChIJu4u41KBHAQcRPp7B7Wi6dZo';
        googleReviewsLink.href = `https://search.google.com/local/reviews?placeid=${placeId}`;
        
        console.log("Buscando avaliações reais do Google via API...");
        
        // Fazer requisição ao endpoint do backend com cache-busting para evitar problemas de cache
        const timestamp = new Date().getTime();
        const url = `/get_google_reviews?_=${timestamp}`;
        console.log("URL da requisição:", url);
        
        fetch(url, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            method: 'GET'
        })
        .then(response => {
            console.log("Resposta recebida:", response.status);
            if (!response.ok) {
                throw new Error(`Resposta do servidor não OK: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Dados JSON recebidos com sucesso:", data);
            
            // Remover indicador de carregamento
            if (loadingIndicator) {
                loadingIndicator.remove();
                console.log("Indicador de carregamento removido");
            }
            
            // Verifica se temos reviews para mostrar (mesmo que sejam fallback)
            if (data.success && data.reviews && data.reviews.length > 0) {
                console.log(`Encontradas ${data.reviews.length} avaliações para exibir`);
                
                // Exibir botão para mais avaliações
                moreReviewsButton.classList.remove('hidden');
                console.log("Botão 'Ver mais' exibido");
                
                // Se estamos usando dados de fallback, mostrar indicador sutil
                if (data.is_fallback) {
                    console.log("Usando dados de fallback");
                    const fallbackNote = document.createElement('div');
                    fallbackNote.className = 'text-center text-sm text-gray-500 mb-4 col-span-1 md:col-span-3';
                    fallbackNote.innerHTML = 'Mostrando avaliações armazenadas. Atualize a página para tentar novamente.';
                    testimonialsContainer.appendChild(fallbackNote);
                }
                
                // Exibir cada avaliação 
                data.reviews.forEach((review, index) => {
                    console.log(`Processando avaliação ${index+1}:`, review.author_name);
                    
                    const delay = 0.2 * (index + 1);
                    
                    // Criar o elemento do depoimento
                    const testimonialEl = document.createElement('div');
                    testimonialEl.className = 'bg-gray-50 rounded-xl p-8 shadow-md fade-in';
                    testimonialEl.style.animationDelay = `${delay}s`;
                    
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
                    
                    // Formatar data da avaliação
                    let timeDescription = review.relative_time_description || '';
                    
                    // Limitar o tamanho do texto para evitar depoimentos muito longos
                    const maxLength = 250;
                    let reviewText = review.text || '';
                    if (reviewText.length > maxLength) {
                        reviewText = reviewText.substring(0, maxLength) + '...';
                    }
                    
                    // Garantir que a URL da foto existe
                    const photoUrl = review.profile_photo_url || '';
                    const authorName = review.author_name || 'Cliente';
                    
                    // Definir o HTML do depoimento
                    testimonialEl.innerHTML = `
                        <div class="flex items-center mb-4">
                            <div class="text-yellow-400 mr-2">
                                ${starsHTML}
                            </div>
                            <div class="text-gray-500 text-sm ml-auto">
                                ${timeDescription}
                            </div>
                        </div>
                        <p class="text-gray-600 mb-6">"${reviewText}"</p>
                        <div class="flex items-center">
                            <div class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                                <img src="${photoUrl}" alt="${authorName}" class="w-full h-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random'">
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800">${authorName}</h4>
                                <p class="text-gray-500 text-sm">${timeDescription || 'Cliente Google'}</p>
                            </div>
                        </div>
                    `;
                    
                    // Adicionar o depoimento ao container
                    testimonialsContainer.appendChild(testimonialEl);
                    console.log(`Avaliação ${index+1} adicionada ao DOM`);
                    
                    // Adicionar a classe 'animated' para iniciar a animação
                    setTimeout(() => {
                        testimonialEl.classList.add('animated');
                        console.log(`Animação da avaliação ${index+1} iniciada`);
                    }, 100); // Um pequeno delay para garantir que a animação funcione
                });
            } else {
                console.warn("Não foram encontradas avaliações para exibir");
                // Se mesmo com fallback não temos reviews, mostrar mensagem amigável
                showErrorMessage("Não foi possível carregar as avaliações no momento.");
            }
        })
        .catch(error => {
            console.error('Erro ao buscar avaliações:', error);
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
            
            // Mostrar mensagem de erro com botão para tentar novamente
            showErrorMessage("Ocorreu um erro ao carregar as avaliações. Por favor, tente novamente.");
        });
    }
    
    // Função para exibir mensagem de erro
    function showErrorMessage(message) {
        console.log("Exibindo mensagem de erro:", message);
        const testimonialsContainer = document.getElementById('testimonials-container');
        const placeId = 'ChIJu4u41KBHAQcRPp7B7Wi6dZo';
        
        const errorEl = document.createElement('div');
        errorEl.className = 'bg-gray-50 rounded-xl p-8 shadow-md text-center col-span-1 md:col-span-3';
        errorEl.innerHTML = `
            <div class="mb-4 text-red-500">
                <i class="fas fa-exclamation-circle text-2xl"></i>
            </div>
            <p class="text-gray-700">${message}</p>
            <p class="text-gray-600 mt-2">Por favor, visite nossa página do Google para ver os depoimentos de nossos clientes.</p>
            <div class="mt-4">
                <a href="https://search.google.com/local/reviews?placeid=${placeId}" target="_blank" class="text-blue-500 hover:text-blue-700">
                    <i class="fab fa-google mr-1"></i> Ver avaliações no Google
                </a>
            </div>
            <button id="retry-button" class="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors">
                <i class="fas fa-redo mr-1"></i> Tentar novamente
            </button>
        `;
        testimonialsContainer.appendChild(errorEl);
        console.log("Mensagem de erro adicionada ao DOM");
        
        // Adicionar evento para o botão de tentar novamente
        document.getElementById('retry-button').addEventListener('click', function() {
            console.log("Botão 'Tentar novamente' clicado");
            // Limpar conteúdo e mostrar indicador de carregamento
            testimonialsContainer.innerHTML = `
                <div id="loading-indicator" class="bg-gray-50 rounded-xl p-8 shadow-md fade-in text-center col-span-1 md:col-span-3">
                    <div class="flex items-center justify-center mb-4">
                        <i class="fas fa-spinner fa-pulse text-blue-500 text-2xl"></i>
                    </div>
                    <p class="text-gray-600">Carregando depoimentos reais do Google Reviews...</p>
                </div>
            `;
            
            // Chamar a função novamente
            setTimeout(loadGoogleReviews, 500);
        });
        
        // Esconder o botão de ver mais
        document.getElementById('more-reviews-button').classList.add('hidden');
        console.log("Botão 'Ver mais' escondido");
    }
    
    // Carregar depoimentos após o carregamento da página
    // Adicionado um delay para garantir que todos os elementos da página estejam carregados
    setTimeout(loadGoogleReviews, 1000);
});