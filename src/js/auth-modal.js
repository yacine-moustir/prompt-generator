import { signIn, signUp } from '../services/auth';

export class AuthModal {
  constructor() {
    this.modal = null;
    this.isLoginView = true;
    this.init();
  }

  init() {
    this.createModal();
    this.setupEventListeners();
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal';
    this.modal.id = 'auth-modal';
    this.modal.style.display = 'none';
    
    this.modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="auth-modal-title">Connexion</h2>
          <button class="close-btn" id="close-auth-modal">&times;</button>
        </div>
        <div class="modal-body">
          <form id="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder="votre@email.com"
              >
            </div>
            
            <div id="password-fields" style="display: none;">
              <div class="form-group">
                <label for="password">Mot de passe</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  minlength="8"
                  placeholder="••••••••"
                >
              </div>
              <div class="form-group">
                <label for="confirm-password">Confirmer le mot de passe</label>
                <input 
                  type="password" 
                  id="confirm-password" 
                  name="confirmPassword" 
                  minlength="8"
                  placeholder="••••••••"
                >
              </div>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block" id="submit-btn">
              Se connecter
            </button>
            
            <div class="form-footer">
              <p id="toggle-auth-mode">
                Pas encore de compte ? <a href="#" id="toggle-auth-link">S'inscrire</a>
              </p>
              <p class="text-sm text-muted">
                En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
              </p>
            </div>
          </form>
          
          <div id="auth-message" class="alert" style="display: none;"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.modal);
  }

  setupEventListeners() {
    // Bouton pour basculer entre connexion et inscription
    const toggleLink = this.modal.querySelector('#toggle-auth-link');
    if (toggleLink) {
      toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleAuthMode();
      });
    }

    // Fermer la modale
    const closeBtn = this.modal.querySelector('#close-auth-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Soumission du formulaire
    const form = this.modal.querySelector('#auth-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Fermer en cliquant en dehors de la modale
    window.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });
  }

  toggleAuthMode() {
    this.isLoginView = !this.isLoginView;
    this.updateView();
  }

  updateView() {
    const title = this.modal.querySelector('#auth-modal-title');
    const submitBtn = this.modal.querySelector('#submit-btn');
    const toggleText = this.modal.querySelector('#toggle-auth-mode');
    const passwordFields = this.modal.querySelector('#password-fields');
    
    if (this.isLoginView) {
      title.textContent = 'Connexion';
      submitBtn.textContent = 'Se connecter';
      toggleText.innerHTML = 'Pas encore de compte ? <a href="#" id="toggle-auth-link">S\'inscrire</a>';
      passwordFields.style.display = 'none';
    } else {
      title.textContent = 'Créer un compte';
      submitBtn.textContent = 'S\'inscrire';
      toggleText.innerHTML = 'Déjà un compte ? <a href="#" id="toggle-auth-link">Se connecter</a>';
      passwordFields.style.display = 'block';
    }
    
    // Réattacher l'écouteur d'événement après la mise à jour du DOM
    const toggleLink = this.modal.querySelector('#toggle-auth-link');
    if (toggleLink) {
      toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleAuthMode();
      });
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const email = this.modal.querySelector('#email').value.trim();
    const password = this.modal.querySelector('#password')?.value;
    const confirmPassword = this.modal.querySelector('#confirm-password')?.value;
    const messageEl = this.modal.querySelector('#auth-message');
    
    // Réinitialiser les messages d'erreur
    messageEl.style.display = 'none';
    messageEl.className = 'alert';
    
    try {
      // Validation de base
      if (!email) {
        throw new Error('Veuillez entrer une adresse email.');
      }
      
      if (!this.isLoginView) {
        if (!password || password.length < 8) {
          throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
        }
        
        if (password !== confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas.');
        }
      }
      
      // Appel au service d'authentification approprié
      if (this.isLoginView) {
        await signIn(email);
        this.showMessage('Un lien de connexion a été envoyé à votre adresse email.', 'success');
      } else {
        await signUp(email);
        this.showMessage('Un lien de confirmation a été envoyé à votre adresse email.', 'success');
      }
      
      // Fermer la modale après un court délai
      setTimeout(() => this.hide(), 2000);
      
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      this.showMessage(error.message || 'Une erreur est survenue. Veuillez réessayer.', 'error');
    }
  }

  showMessage(message, type = 'info') {
    const messageEl = this.modal.querySelector('#auth-message');
    messageEl.textContent = message;
    messageEl.className = `alert alert-${type}`;
    messageEl.style.display = 'block';
    
    // Faire défiler jusqu'au message
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  show(isLogin = true) {
    this.isLoginView = isLogin;
    this.updateView();
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Empêcher le défilement de la page
    
    // Mettre le focus sur le champ email
    const emailInput = this.modal.querySelector('#email');
    if (emailInput) {
      setTimeout(() => emailInput.focus(), 100);
    }
  }

  hide() {
    this.modal.style.display = 'none';
    document.body.style.overflow = ''; // Rétablir le défilement de la page
    
    // Réinitialiser le formulaire
    const form = this.modal.querySelector('#auth-form');
    if (form) form.reset();
    
    // Cacher les messages
    const messageEl = this.modal.querySelector('#auth-message');
    if (messageEl) messageEl.style.display = 'none';
  }
}

// Initialisation de la modale d'authentification
export const initAuthModal = () => {
  const authModal = new AuthModal();
  
  // Exposer les méthodes pour ouvrir la modale depuis d'autres parties de l'application
  window.showLoginModal = () => authModal.show(true);
  window.showSignupModal = () => authModal.show(false);
  
  return authModal;
};
