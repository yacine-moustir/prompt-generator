import { signOut } from '../services/auth';
import { hasFullAccess } from '../services/payment';

export class NavBar {
  constructor() {
    this.navElement = document.createElement('nav');
    this.navElement.className = 'navbar';
    this.user = null;
    this.init();
  }

  async init() {
    this.render();
    this.setupEventListeners();
  }

  setUser(user) {
    this.user = user;
    this.render();
  }

  async render() {
    this.navElement.innerHTML = `
      <div class="navbar-container">
        <div class="navbar-brand">
          <a href="/">Forecraft</a>
        </div>
        <div class="navbar-links">
          ${this.user ? this.renderUserMenu() : this.renderAuthButtons()}
        </div>
      </div>
    `;
  }

  renderAuthButtons() {
    return `
      <div class="auth-buttons">
        <button class="btn btn-outline" id="login-btn">Se connecter</button>
        <button class="btn btn-primary" id="signup-btn">S'inscrire</button>
      </div>
    `;
  }

  async renderUserMenu() {
    const hasPremium = this.user ? await hasFullAccess() : false;
    
    return `
      <div class="user-menu">
        ${hasPremium ? '<span class="badge premium">Premium</span>' : ''}
        <div class="dropdown">
          <button class="btn btn-text dropdown-toggle" id="user-menu">
            ${this.user.email}
            <i class="icon-chevron-down"></i>
          </button>
          <div class="dropdown-menu">
            ${!hasPremium ? `
              <a href="/pricing" class="dropdown-item">Passer Premium</a>
              <div class="dropdown-divider"></div>
            ` : ''}
            <a href="/account" class="dropdown-item">Mon compte</a>
            <button class="dropdown-item" id="logout-btn">Déconnexion</button>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Les écouteurs d'événements seront ajoutés dynamiquement
    // car le contenu est régénéré à chaque rendu
    document.addEventListener('click', (e) => {
      // Gérer la déconnexion
      if (e.target.closest('#logout-btn')) {
        e.preventDefault();
        this.handleLogout();
      }
      
      // Gérer le menu déroulant
      if (e.target.closest('#user-menu')) {
        e.preventDefault();
        document.querySelector('.dropdown-menu').classList.toggle('show');
      } else if (!e.target.closest('.dropdown')) {
        const dropdowns = document.querySelectorAll('.dropdown-menu');
        dropdowns.forEach(dropdown => dropdown.classList.remove('show'));
      }
    });
  }

  async handleLogout() {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Afficher un message d'erreur à l'utilisateur
      alert('Une erreur est survenue lors de la déconnexion. Veuillez réessayer.');
    }
  }

  getElement() {
    return this.navElement;
  }
}

// Initialisation de la barre de navigation
export const initNav = () => {
  const navBar = new NavBar();
  const header = document.querySelector('header');
  
  if (header) {
    header.prepend(navBar.getElement());
  } else {
    document.body.insertBefore(navBar.getElement(), document.body.firstChild);
  }
  
  return navBar;
};
