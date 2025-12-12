// Importation des modules ES
import { initAuthModal } from './auth-modal.js';
import { initNav } from './nav.js';
import { onAuthStateChange } from '../services/auth.js';
import { hasFullAccess } from '../services/payment.js';

// Importation des styles
import '../css/auth.css';

// Classe principale de l'application
class App {
  constructor() {
    this.currentUser = null;
    this.navBar = null;
    this.authModal = null;
  }

  async init() {
    // Initialisation des composants UI
    this.navBar = initNav();
    this.authModal = initAuthModal();
    
    // Configuration des écouteurs d'événements globaux
    this.setupGlobalEventListeners();
    
    // Vérification de l'état d'authentification initial
    this.setupAuthStateListener();
    
    // Initialisation des composants spécifiques aux pages
    this.initPageSpecificComponents();
  }

  setupGlobalEventListeners() {
    // Gestion des clics sur les boutons de connexion/inscription globaux
    document.addEventListener('click', (e) => {
      // Clic sur un bouton de connexion
      if (e.target.matches('[data-action="login"]') || 
          e.target.closest('[data-action="login"]')) {
        e.preventDefault();
        this.authModal.show(true);
      }
      
      // Clic sur un bouton d'inscription
      if (e.target.matches('[data-action="signup"]') || 
          e.target.closest('[data-action="signup"]')) {
        e.preventDefault();
        this.authModal.show(false);
      }
      
      // Clic sur un bouton de déconnexion
      if (e.target.matches('[data-action="logout"]') || 
          e.target.closest('[data-action="logout"]')) {
        e.preventDefault();
        this.handleLogout();
      }
    });
    
    // Gestion des clics sur les boutons d'achat
    document.addEventListener('click', async (e) => {
      const buyButton = e.target.closest('[data-buy-template]');
      if (buyButton) {
        e.preventDefault();
        await this.handleBuyClick(buyButton);
      }
    });
    
    // Gestion des clics sur les templates verrouillés
    document.addEventListener('click', async (e) => {
      const template = e.target.closest('.template[data-locked="true"]');
      if (template) {
        e.preventDefault();
        this.showUpgradePrompt();
      }
    });
  }
  
  setupAuthStateListener() {
    // Écoute des changements d'état d'authentification
    onAuthStateChange(async (event, user) => {
      this.currentUser = user;
      
      // Mise à jour de la barre de navigation
      if (this.navBar) {
        this.navBar.setUser(user);
      }
      
      // Mise à jour de l'interface utilisateur en fonction de l'état d'authentification
      this.updateUIForAuthState(!!user);
      
      // Si l'utilisateur est connecté, vérifier son statut premium
      if (user) {
        await this.checkPremiumStatus();
      }
    });
  }
  
  async checkPremiumStatus() {
    if (!this.currentUser) return;
    
    try {
      const isPremium = await hasFullAccess();
      document.body.classList.toggle('user-premium', isPremium);
      
      // Mettre à jour l'affichage des templates verrouillés
      this.updateLockedTemplates(!isPremium);
      
    } catch (error) {
      console.error('Erreur lors de la vérification du statut premium:', error);
    }
  }
  
  updateUIForAuthState(isAuthenticated) {
    // Mettre à jour les éléments qui dépendent de l'état d'authentification
    const authElements = document.querySelectorAll('[data-auth-state]');
    authElements.forEach(el => {
      const showWhen = el.getAttribute('data-auth-state');
      el.style.display = (showWhen === 'authenticated') === isAuthenticated ? '' : 'none';
    });
    
    // Mettre à jour le texte des boutons de connexion/déconnexion
    const authButtons = document.querySelectorAll('[data-auth-action]');
    authButtons.forEach(btn => {
      const action = btn.getAttribute('data-auth-action');
      if (action === 'toggle') {
        btn.textContent = isAuthenticated ? 'Déconnexion' : 'Connexion';
        btn.setAttribute('data-action', isAuthenticated ? 'logout' : 'login');
      }
    });
    
    // Mettre à jour le nom d'utilisateur si un élément existe pour l'afficher
    const userDisplayElements = document.querySelectorAll('[data-user-name]');
    if (userDisplayElements.length > 0 && this.currentUser) {
      userDisplayElements.forEach(el => {
        el.textContent = this.currentUser.email;
      });
    }
  }
  
  updateLockedTemplates(showLocks) {
    const templates = document.querySelectorAll('.template');
    templates.forEach(template => {
      const isLocked = template.getAttribute('data-locked') === 'true';
      
      if (showLocks && isLocked) {
        template.classList.add('locked');
        template.setAttribute('aria-disabled', 'true');
        
        // Ajouter l'icône de cadenas si elle n'existe pas déjà
        if (!template.querySelector('.lock-icon')) {
          const lockIcon = document.createElement('span');
          lockIcon.className = 'lock-icon';
          lockIcon.innerHTML = '🔒';
          template.prepend(lockIcon);
        }
      } else {
        template.classList.remove('locked');
        template.removeAttribute('aria-disabled');
        
        // Supprimer l'icône de cadenas si elle existe
        const lockIcon = template.querySelector('.lock-icon');
        if (lockIcon) {
          lockIcon.remove();
        }
      }
    });
  }
  
  async handleBuyClick(button) {
    if (!this.currentUser) {
      // Rediriger vers la page de connexion avec un retour vers la page actuelle
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?redirect=${currentUrl}`;
      return;
    }
    
    const templateId = button.getAttribute('data-buy-template');
    const isPremium = await hasFullAccess();
    
    if (isPremium) {
      // L'utilisateur a déjà un abonnement premium, pas besoin d'acheter à nouveau
      this.showMessage('Vous avez déjà accès à tous les templates !', 'info');
      return;
    }
    
    try {
      // Afficher un indicateur de chargement
      const originalText = button.innerHTML;
      button.disabled = true;
      button.innerHTML = 'Traitement...';
      
      // Créer une session de paiement Stripe
      const { createCheckoutSession } = await import('../services/payment.js');
      await createCheckoutSession(templateId);
      
    } catch (error) {
      console.error('Erreur lors de la création de la session de paiement:', error);
      this.showMessage('Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer.', 'error');
      
      // Réactiver le bouton
      button.disabled = false;
      button.innerHTML = originalText;
    }
  }
  
  showUpgradePrompt() {
    if (!this.currentUser) {
      // Si l'utilisateur n'est pas connecté, afficher la modale de connexion
      this.authModal.show(true);
      return;
    }
    
    // Afficher une invite pour mettre à niveau vers le plan premium
    const upgrade = confirm('Ce template est verrouillé. Voulez-vous accéder à tous les templates avec un abonnement premium ?');
    if (upgrade) {
      // Rediriger vers la page de tarification
      window.location.href = '/pricing';
    }
  }
  
  showMessage(message, type = 'info') {
    // Créer un élément de message s'il n'existe pas déjà
    let messageEl = document.getElementById('global-message');
    
    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.id = 'global-message';
      messageEl.className = `alert alert-${type}`;
      document.body.appendChild(messageEl);
      
      // Positionner le message en haut de la page
      messageEl.style.position = 'fixed';
      messageEl.style.top = '20px';
      messageEl.style.left = '50%';
      messageEl.style.transform = 'translateX(-50%)';
      messageEl.style.zIndex = '9999';
      messageEl.style.padding = '12px 24px';
      messageEl.style.borderRadius = '6px';
      messageEl.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      messageEl.style.maxWidth = '90%';
      messageEl.style.textAlign = 'center';
      messageEl.style.transition = 'all 0.3s ease';
      
      // Styles spécifiques au type de message
      if (type === 'error') {
        messageEl.style.backgroundColor = '#fee2e2';
        messageEl.style.color = '#b91c1c';
        messageEl.style.borderLeft = '4px solid #dc2626';
      } else if (type === 'success') {
        messageEl.style.backgroundColor = '#dcfce7';
        messageEl.style.color = '#166534';
        messageEl.style.borderLeft = '4px solid #16a34a';
      } else {
        messageEl.style.backgroundColor = '#dbeafe';
        messageEl.style.color = '#1e40af';
        messageEl.style.borderLeft = '4px solid #3b82f6';
      }
    }
    
    // Mettre à jour le message
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    
    // Masquer le message après 5 secondes
    clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      messageEl.style.opacity = '0';
      setTimeout(() => {
        messageEl.style.display = 'none';
        messageEl.style.opacity = '1';
      }, 300);
    }, 5000);
  }
  
  async handleLogout() {
    try {
      const { signOut } = await import('../services/auth.js');
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      this.showMessage('Une erreur est survenue lors de la déconnexion. Veuillez réessayer.', 'error');
    }
  }
  
  initPageSpecificComponents() {
    // Initialiser les composants spécifiques à la page actuelle
    const path = window.location.pathname;
    
    if (path === '/pricing' || path === '/pricing.html') {
      this.initPricingPage();
    } else if (path === '/account' || path === '/account.html') {
      this.initAccountPage();
    } else if (path === '/auth/callback') {
      this.handleAuthCallback();
    }
  }
  
  initPricingPage() {
    // Initialisation spécifique à la page de tarification
    const pricingToggles = document.querySelectorAll('.pricing-toggle input[type="radio"]');
    
    pricingToggles.forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const period = e.target.value;
        document.querySelectorAll('.pricing-plan').forEach(plan => {
          plan.setAttribute('data-billing-period', period);
        });
      });
    });
    
    // Gestion des clics sur les boutons d'achat
    const buyButtons = document.querySelectorAll('.pricing-plan .btn-primary');
    buyButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const planId = button.closest('.pricing-plan').getAttribute('data-plan-id');
        await this.handleBuyClick({ getAttribute: () => planId });
      });
    });
  }
  
  initAccountPage() {
    // Initialisation spécifique à la page de compte
    if (!this.currentUser) {
      window.location.href = '/login?redirect=/account';
      return;
    }
    
    this.loadUserData();
  }
  
  async loadUserData() {
    try {
      // Charger les données utilisateur
      const { getPaymentHistory } = await import('../services/payment.js');
      const payments = await getPaymentHistory();
      
      // Mettre à jour l'interface utilisateur avec les données de paiement
      this.updatePaymentHistory(payments);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      this.showMessage('Une erreur est survenue lors du chargement de vos données. Veuillez rafraîchir la page.', 'error');
    }
  }
  
  updatePaymentHistory(payments) {
    const historyContainer = document.getElementById('payment-history');
    if (!historyContainer) return;
    
    if (!payments || payments.length === 0) {
      historyContainer.innerHTML = '<p>Aucun historique de paiement pour le moment.</p>';
      return;
    }
    
    const html = `
      <div class="table-responsive">
        <table class="payment-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Montant</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            ${payments.map(payment => `
              <tr>
                <td>${new Date(payment.created_at).toLocaleDateString()}</td>
                <td>${this.getPaymentDescription(payment)}</td>
                <td>${this.formatCurrency(payment.amount, payment.currency)}</td>
                <td><span class="status-badge status-${payment.status}">${this.formatStatus(payment.status)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    historyContainer.innerHTML = html;
  }
  
  getPaymentDescription(payment) {
    if (payment.template_id === 'all') {
      return 'Accès complet à tous les templates';
    }
    return `Template: ${payment.template_id}`;
  }
  
  formatCurrency(amount, currency = 'eur') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2
    }).format(amount / 100); // Convertir les centimes en euros
  }
  
  formatStatus(status) {
    const statusMap = {
      'paid': 'Payé',
      'pending': 'En attente',
      'failed': 'Échoué',
      'refunded': 'Remboursé'
    };
    return statusMap[status] || status;
  }
  
  async handleAuthCallback() {
    // Gérer le retour d'authentification OAuth
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      // Rediriger vers la page d'origine ou la page d'accueil
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect') || '/';
      
      window.location.href = redirectTo;
      
    } catch (error) {
      console.error('Erreur lors de la gestion du callback d\'authentification:', error);
      this.showMessage('Une erreur est survenue lors de la connexion. Veuillez réessayer.', 'error');
      window.location.href = '/';
    }
  }
}

// Initialisation de l'application lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});

// Exporter l'instance de l'application pour un accès global (si nécessaire)
window.App = App;
