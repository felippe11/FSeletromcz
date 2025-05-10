// Corrige problemas de overflow horizontal em dispositivos móveis
document.addEventListener('DOMContentLoaded', function() {
    // Forçar o tamanho correto de visualização no carregamento da página
    function fixViewport() {
        // Define largura máxima para o corpo da página
        document.documentElement.style.width = '100%';
        document.documentElement.style.maxWidth = '100%';
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.width = '100%';
        document.body.style.maxWidth = '100%';
        document.body.style.overflowX = 'hidden';
        
        // Verifica se estamos na página index
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            console.log('Aplicando correções para a página index');
            
            // Corrige elementos específicos da página index que podem causar overflow
            const mainContent = document.getElementById('content');
            if (mainContent) {
                mainContent.style.width = '100%';
                mainContent.style.maxWidth = '100%';
                mainContent.style.overflowX = 'hidden';
            }
            
            // Forçar recálculo de layout
            setTimeout(function() {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        }
    }
    
    // Executa a função no carregamento da página
    fixViewport();
    
    // Executa novamente após um atraso para garantir que todos os elementos foram carregados
    setTimeout(fixViewport, 500);
    
    // Adiciona uma observação para orientação da tela (quando o dispositivo é girado)
    window.addEventListener('orientationchange', function() {
        setTimeout(fixViewport, 200);
    });
    
    // Adiciona observação para redimensionamento da janela
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) { // Apenas para dispositivos móveis
            setTimeout(fixViewport, 100);
        }
    });
});
