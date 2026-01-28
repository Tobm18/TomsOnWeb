// Fichier commun pour gérer l'authentification et l'interface utilisateur

let hoverTimeout = null;

// Créer le popup avatar dynamiquement
function createAvatarPopup() {
    const popup = document.createElement('div');
    popup.id = 'avatar-popup';
    popup.className = 'avatar-popup';
    popup.innerHTML = `
        <div class="avatar-popup-content">
            <p class="avatar-popup-message" id="popup-message"></p>
            <button class="avatar-popup-btn" id="popup-login-btn" style="display: none;" onclick="window.location.href='login.html'">
                <i class="fa-solid fa-right-to-bracket"></i> Connexion
            </button>
        </div>
    `;
    document.body.appendChild(popup);
}

// Afficher le popup avatar
function showAvatarPopup() {
    const currentUserEmail = localStorage.getItem('currentUser');
    const popup = document.getElementById('avatar-popup');
    const message = document.getElementById('popup-message');
    const loginBtn = document.getElementById('popup-login-btn');
    
    if (!popup) return;
    
    if (currentUserEmail) {
        const userDataJson = localStorage.getItem(`user_${currentUserEmail}`);
        if (userDataJson) {
            const userData = JSON.parse(userDataJson);
            message.innerHTML = `
                <i class="fa-solid fa-circle-check"></i> Bienvenu <strong>${userData.username}</strong>
                <br><small class="popup-email">${userData.email}</small>
            `;
        }
        loginBtn.style.display = 'none';
    } else {
        message.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Vous n'êtes pas connectés`;
        loginBtn.style.display = 'block';
    }
    
    popup.classList.add('show');
}

// Cacher le popup avatar
function hideAvatarPopup() {
    const popup = document.getElementById('avatar-popup');
    if (popup) {
        popup.classList.remove('show');
    }
}

// Initialiser les événements de l'avatar
function initAvatarEvents() {
    const avatarElement = document.getElementById('user-avatar');
    
    if (!avatarElement) return;
    
    // Événement hover
    avatarElement.addEventListener('mouseenter', () => {
        hoverTimeout = setTimeout(() => {
            showAvatarPopup();
        }, 850);
    });
    
    avatarElement.addEventListener('mouseleave', () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
    });
    
    // Événement clic
    avatarElement.addEventListener('click', () => {
        const popup = document.getElementById('avatar-popup');
        if (popup && popup.classList.contains('show')) {
            hideAvatarPopup();
        } else {
            showAvatarPopup();
        }
    });
}

// Fermer le popup quand on clique en dehors
function initPopupCloseEvents() {
    document.addEventListener('click', (e) => {
        const popup = document.getElementById('avatar-popup');
        const avatar = document.getElementById('user-avatar');
        
        if (popup && avatar && !popup.contains(e.target) && !avatar.contains(e.target)) {
            hideAvatarPopup();
        }
    });
}

// Fermer le popup avec le scroll
window.addEventListener('scroll', () => {
    hideAvatarPopup();
});

// Gérer l'affichage de l'avatar et du bouton logout
function updateUserInterface() {
    const currentUserEmail = localStorage.getItem('currentUser');
    const avatarElement = document.getElementById('user-avatar');
    const logoutBtn = document.getElementById('logout-btn');
    const fantomLogo = document.getElementById('fantom-logo');
    
    if (currentUserEmail) {
        // Utilisateur connecté
        const userDataJson = localStorage.getItem(`user_${currentUserEmail}`);
        if (userDataJson) {
            const userData = JSON.parse(userDataJson);
            const initials = userData.username.substring(0, 2).toUpperCase();
            avatarElement.innerHTML = `<span style="font-size: 1.2rem; font-weight: bold; color: white;">${initials}</span>`;
            avatarElement.style.background = 'linear-gradient(135deg, #00aaff, #0044ff)';
            avatarElement.title = userData.username;
        }
        
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
            if (fantomLogo) fantomLogo.style.display = 'none';
        }
    } else {
        // Utilisateur non connecté
        avatarElement.innerHTML = '<i class="fa-solid fa-user"></i>';
        avatarElement.style.background = 'rgba(0, 170, 255, 0.2)';
        avatarElement.title = 'Non connecté';
        
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
            if (fantomLogo) fantomLogo.style.display = 'block';
        }
    }
}

// Fonction de déconnexion
function handleLogout() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('selectedGame');
            updateUserInterface();
            // Rediriger vers la page d'accueil
            window.location.href = 'index.html';
        }
    }
}

// Initialiser l'interface utilisateur au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    createAvatarPopup();
    updateUserInterface();
    initAvatarEvents();
    initPopupCloseEvents();
});
