import { hasAccessToTemplate, hasFullAccess } from '../services/payment.js';

export class TemplateManager {
  constructor() {
    this.templates = [];
    this.freeTemplateId = 'race'; // ID du template gratuit
    this.init();
  }

  async init() {
    // Récupérer la liste des templates depuis le serveur ou les définir en dur
    this.templates = await this.loadTemplates();
    
    // Initialiser les templates
    this.renderTemplates();
    
    // Vérifier les accès utilisateur
    await this.checkTemplateAccess();
  }
  
  async loadTemplates() {
    // Dans une vraie application, cela pourrait être un appel API
    return [
      {
        id: 'race',
        name: 'RACE',
        description: 'Role, Action, Context, Examples',
        isFree: true,
        locked: false
      },
      {
        id: 'care',
        name: 'CARE',
        description: 'Context, Action, Result, Examples',
        price: 2.89,
        locked: true
      },
      {
        id: 'create',
        name: 'CREATE',
        description: 'Context, Request, Examples, Adjustments, Target',
        price: 2.89,
        locked: true
      },
      {
        id: 'roses',
        name: 'ROSES',
        description: 'Role, Objective, Steps, End Goal, Style',
        price: 2.89,
        locked: true
      },
      {
        id: 'craft',
        name: 'CRAFT',
        description: 'Context, Request, Adjustments, Format, Tone',
        price: 2.89,
        locked: true
      },
      {
        id: 'all',
        name: 'Tous les modèles',
        description: 'Accès illimité à tous les modèles',
        price: 9.79,
        isBundle: true,
        locked: true
      }
    ];
  }
  
  renderTemplates() {
    const container = document.querySelector('.templates-container');
    
    if (!container) {
      console.warn('Conteneur de templates introuvable');
      return;
    }
    
    let html = `
      <div class="templates-grid">
        ${this.templates.map(template => this.renderTemplateCard(template)).join('')}
      </div>
    `;
    
    container.innerHTML = html;
    
    // Ajouter les écouteurs d'événements
    this.addTemplateEventListeners();
  }
  
  renderTemplateCard(template) {
    const isFree = template.id === this.freeTemplateId || template.isFree;
    const priceText = template.isBundle 
      ? `Tout débloquer: ${template.price}€` 
      : isFree ? 'Gratuit' : `${template.price}€`;
    
    return `
      <div class="template-card ${template.locked ? 'locked' : ''}" 
           data-template-id="${template.id}"
           data-locked="${template.locked}">
        
        <div class="template-header">
          <h3>${template.name}</h3>
          <span class="template-price ${isFree ? 'free' : 'premium'}">
            ${priceText}
          </span>
        </div>
        
        <div class="template-description">
          ${template.description}
        </div>
        
        <div class="template-actions">
          ${template.locked 
            ? `<button class="btn btn-outline btn-sm" data-action="unlock" data-template-id="${template.id}">
                Débloquer
               </button>`
            : `<button class="btn btn-primary btn-sm" data-action="select" data-template-id="${template.id}">
                Sélectionner
               </button>`
          }
        </div>
        
        ${template.locked ? '<div class="template-lock-overlay"><span>🔒</span></div>' : ''}
      </div>
    `;
  }
  
  addTemplateEventListeners() {
    // Gestion des clics sur les boutons de déverrouillage
    const unlockButtons = document.querySelectorAll('[data-action="unlock"]');
    unlockButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const templateId = button.getAttribute('data-template-id');
        this.handleUnlockClick(templateId);
      });
    });
    
    // Gestion des clics sur les boutons de sélection
    const selectButtons = document.querySelectorAll('[data-action="select"]');
    selectButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const templateId = button.getAttribute('data-template-id');
        this.handleSelectClick(templateId);
      });
    });
    
    // Gestion des clics sur les cartes de template
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Ne rien faire si on clique sur un bouton à l'intérieur de la carte
        if (e.target.closest('button')) return;
        
        const templateId = card.getAttribute('data-template-id');
        const isLocked = card.getAttribute('data-locked') === 'true';
        
        if (isLocked) {
          this.handleUnlockClick(templateId);
        } else {
          this.handleSelectClick(templateId);
        }
      });
    });
  }
  
  async checkTemplateAccess() {
    const isPremium = await hasFullAccess();
    
    // Si l'utilisateur a un accès premium, tout débloquer
    if (isPremium) {
      this.unlockAllTemplates();
      return;
    }
    
    // Sinon, vérifier l'accès à chaque template
    for (const template of this.templates) {
      if (template.id === this.freeTemplateId || template.isFree) {
        // Le template gratuit est toujours débloqué
        this.updateTemplateLockState(template.id, false);
      } else {
        // Vérifier si l'utilisateur a accès à ce template
        const hasAccess = await hasAccessToTemplate(template.id);
        this.updateTemplateLockState(template.id, !hasAccess);
      }
    }
  }
  
  updateTemplateLockState(templateId, isLocked) {
    // Mettre à jour l'état dans le tableau des templates
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      template.locked = isLocked;
    }
    
    // Mettre à jour l'interface utilisateur
    const templateElement = document.querySelector(`[data-template-id="${templateId}"]`);
    if (templateElement) {
      templateElement.setAttribute('data-locked', isLocked);
      templateElement.classList.toggle('locked', isLocked);
      
      // Mettre à jour le bouton
      const button = templateElement.querySelector('button');
      if (button) {
        if (isLocked) {
          button.textContent = 'Débloquer';
          button.setAttribute('data-action', 'unlock');
          button.className = 'btn btn-outline btn-sm';
          
          // Ajouter l'overlay de verrouillage s'il n'existe pas
          if (!templateElement.querySelector('.template-lock-overlay')) {
            const lockOverlay = document.createElement('div');
            lockOverlay.className = 'template-lock-overlay';
            lockOverlay.innerHTML = '<span>🔒</span>';
            templateElement.appendChild(lockOverlay);
          }
        } else {
          button.textContent = 'Sélectionner';
          button.setAttribute('data-action', 'select');
          button.className = 'btn btn-primary btn-sm';
          
          // Supprimer l'overlay de verrouillage s'il existe
          const lockOverlay = templateElement.querySelector('.template-lock-overlay');
          if (lockOverlay) {
            lockOverlay.remove();
          }
        }
      }
    }
  }
  
  async handleUnlockClick(templateId) {
    // Vérifier si l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Rediriger vers la page de connexion avec un retour vers la page actuelle
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?redirect=${currentUrl}`;
      return;
    }
    
    // Trouver le template sélectionné
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;
    
    // Si c'est le bundle "Tous les modèles"
    if (templateId === 'all') {
      // Rediriger vers la page de paiement pour le bundle complet
      window.location.href = `/pricing?plan=all`;
      return;
    }
    
    // Vérifier si l'utilisateur a déjà accès à ce template
    const hasAccess = await hasAccessToTemplate(templateId);
    if (hasAccess) {
      // Débloquer le template s'il y a déjà accès
      this.updateTemplateLockState(templateId, false);
      return;
    }
    
    // Rediriger vers la page de paiement pour ce template
    window.location.href = `/pricing?template=${templateId}`;
  }
  
  handleSelectClick(templateId) {
    // Trouver le template sélectionné
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;
    
    // Mettre en surbrillance le template sélectionné
    document.querySelectorAll('.template-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-template-id="${templateId}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
    }
    
    // Émettre un événement pour informer les autres composants
    const event = new CustomEvent('templateSelected', { 
      detail: { templateId, template } 
    });
    document.dispatchEvent(event);
    
    console.log(`Template sélectionné: ${template.name}`);
  }
  
  unlockAllTemplates() {
    this.templates.forEach(template => {
      if (template.locked) {
        this.updateTemplateLockState(template.id, false);
      }
    });
  }
}

// Initialiser le gestionnaire de templates
export const initTemplates = () => {
  return new TemplateManager();
};

// Exporter une instance globale pour un accès facile
window.TemplateManager = new TemplateManager();
