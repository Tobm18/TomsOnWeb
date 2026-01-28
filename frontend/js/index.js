let currentCard = 0;
const cards = document.querySelectorAll('.game-card');
const totalCards = cards.length;

function rotateCarousel(direction) {
    cards[currentCard].classList.remove('active');
    
    currentCard = (currentCard + direction + totalCards) % totalCards;
    
    cards.forEach((card, index) => {
        card.classList.remove('active');
        const position = (index - currentCard + totalCards) % totalCards;
        card.style.setProperty('--position', position);
    });
    
    cards[currentCard].classList.add('active');
}

// Initialisation
cards.forEach((card, index) => {
    const position = (index - currentCard + totalCards) % totalCards;
    card.style.setProperty('--position', position);
});

// Scroll smooth vers la section jeux
function scrollToGames() {
    const gamesSection = document.getElementById('games-section');
    gamesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Gestion du clic sur les boutons Jouer
function handlePlayClick(gameName) {
    // Vérifier si un utilisateur est connecté
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
        // Utilisateur connecté : stocker le jeu sélectionné et rediriger vers la page du jeu
        localStorage.setItem('selectedGame', gameName);
        window.location.href = 'jeux.html';
    } else {
        // Utilisateur non connecté : stocker le jeu sélectionné et rediriger vers la page de connexion
        localStorage.setItem('selectedGame', gameName);
        window.location.href = 'login.html';
    }
}

// Gestion du header au scroll
let lastScrollTop = 0;
const header = document.querySelector('header');
const scrollThreshold = 10;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (Math.abs(scrollTop - lastScrollTop) < 10) {
        return;
    }
    
    if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
        // Scroll vers le bas
        header.classList.add('header-hidden');
    } else {
        // Scroll vers le haut
        header.classList.remove('header-hidden');
    }
    
    lastScrollTop = scrollTop;
});