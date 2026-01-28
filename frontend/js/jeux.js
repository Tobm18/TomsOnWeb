// Récupérer le jeu sélectionné et afficher son nom
window.addEventListener('DOMContentLoaded', () => {
    const selectedGame = localStorage.getItem('selectedGame');
    const currentUser = localStorage.getItem('currentUser');
    
    // Vérifier si l'utilisateur est connecté
    if (!currentUser) {
        // Rediriger vers la page de connexion si non connecté
        window.location.href = 'login.html';
        return;
    }
    
    // Mapper les noms de jeux
    const gameNames = {
        'cyberquest': 'CyberQuest',
        'fantasy': 'Fantasy Realm',
        'space': 'Space Odyssey'
    };
    
    // Afficher le nom du jeu
    const gameTitleElement = document.getElementById('game-title');
    if (selectedGame && gameNames[selectedGame]) {
        gameTitleElement.textContent = gameNames[selectedGame];
    } else {
        gameTitleElement.textContent = 'Jeu';
    }
    
    // Supprimer le selectedGame après l'avoir utilisé
    localStorage.removeItem('selectedGame');
});

// Fonction pour notifier l'utilisateur
function notify() {
    const selectedGame = localStorage.getItem('selectedGame');
    const currentUser = localStorage.getItem('currentUser');
    
    // Simuler une notification
    alert(`Merci ${currentUser} ! Vous serez notifié dès que le jeu sera disponible. 🎮`);
    
    // Optionnel : stocker la préférence de notification
    const notificationKey = `notify_${selectedGame}_${currentUser}`;
    localStorage.setItem(notificationKey, 'true');
}
