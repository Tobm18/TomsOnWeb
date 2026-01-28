// Fonction pour basculer entre les onglets
function switchTab(tabName) {
    // Récupérer tous les onglets et formulaires
    const tabs = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');
    
    // Retirer la classe active de tous les onglets et formulaires
    tabs.forEach(tab => tab.classList.remove('active'));
    forms.forEach(form => form.classList.remove('active'));
    
    // Ajouter la classe active à l'onglet et au formulaire sélectionnés
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-form`).classList.add('active');
    
    // Effacer le message
    hideMessage();
}

// Fonction pour afficher un message
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message show ${type}`;
    
    // Faire disparaître le message après 5 secondes
    setTimeout(() => {
        hideMessage();
    }, 5000);
}

// Fonction pour cacher le message
function hideMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.className = 'message';
}

// Fonction de gestion de l'inscription
function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    
    // Validation
    if (username.length < 3) {
        showMessage('Le nom d\'utilisateur doit contenir au moins 3 caractères', 'error');
        return;
    }
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Veuillez entrer une adresse email valide', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        showMessage('Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = localStorage.getItem(`user_${email}`);
    if (existingUser) {
        showMessage('Cette adresse email est déjà utilisée', 'error');
        return;
    }
    
    // Sauvegarder l'utilisateur dans le localStorage avec l'email comme clé
    const userData = {
        username: username,
        email: email,
        password: password,
        registeredAt: new Date().toISOString()
    };
    
    localStorage.setItem(`user_${email}`, JSON.stringify(userData));
    localStorage.setItem('currentUser', email);
    
    showMessage('Inscription réussie ! Redirection...', 'success');
    
    // Réinitialiser le formulaire
    document.getElementById('register-form').reset();
    
    // Rediriger vers la page appropriée après 2 secondes
    setTimeout(() => {
        const selectedGame = localStorage.getItem('selectedGame');
        if (selectedGame) {
            window.location.href = 'jeux.html';
        } else {
            window.location.href = 'index.html';
        }
    }, 2000);
}

// Fonction de gestion de la connexion
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Validation
    if (!email || !password) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    // Récupérer l'utilisateur du localStorage avec l'email comme clé
    const userDataJson = localStorage.getItem(`user_${email}`);
    
    if (!userDataJson) {
        showMessage('Adresse email incorrecte', 'error');
        return;
    }
    
    const userData = JSON.parse(userDataJson);
    
    // Vérifier le mot de passe
    if (userData.password !== password) {
        showMessage('Mot de passe incorrect', 'error');
        return;
    }
    
    // Connexion réussie
    localStorage.setItem('currentUser', email);
    showMessage('Connexion réussie ! Redirection...', 'success');
    
    // Réinitialiser le formulaire
    document.getElementById('login-form').reset();
    
    // Rediriger vers la page appropriée après 2 secondes
    setTimeout(() => {
        const selectedGame = localStorage.getItem('selectedGame');
        if (selectedGame) {
            window.location.href = 'jeux.html';
        } else {
            window.location.href = 'index.html';
        }
    }, 2000);
}

// Vérifier si un utilisateur est déjà connecté au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        showMessage(`Vous êtes déjà connecté en tant que ${currentUser}`, 'success');
        setTimeout(() => {
            const selectedGame = localStorage.getItem('selectedGame');
            if (selectedGame) {
                window.location.href = 'jeux.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 2000);
    }
});
