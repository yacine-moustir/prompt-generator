import { supabase } from '../config/supabase';

// Configuration Stripe (à remplacer par votre clé publique Stripe)
const STRIPE_PUBLIC_KEY = 'YOUR_STRIPE_PUBLIC_KEY';

// Charger le script Stripe.js de manière asynchrone
export async function loadStripe() {
  if (window.Stripe) {
    return window.Stripe(STRIPE_PUBLIC_KEY);
  }
  
  // Charger le script Stripe.js
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      if (window.Stripe) {
        resolve(window.Stripe(STRIPE_PUBLIC_KEY));
      } else {
        reject(new Error('Échec du chargement de Stripe.js'));
      }
    };
    script.onerror = () => {
      reject(new Error('Échec du chargement du script Stripe.js'));
    };
    document.head.appendChild(script);
  });
  
  return window.Stripe(STRIPE_PUBLIC_KEY);
}

// Créer une session de paiement
export async function createCheckoutSession(priceId, templateId) {
  try {
    // Vérifier que l'utilisateur est connecté
    const { data: { session: authSession }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !authSession) {
      throw new Error('Vous devez être connecté pour effectuer un paiement');
    }
    
    // Appeler la fonction Supabase Edge pour créer une session de paiement
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId,
        templateId,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: window.location.href
      }
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error);
    throw error;
  }
}

// Rediriger vers la page de paiement Stripe
export async function redirectToCheckout(sessionId) {
  try {
    const stripe = await loadStripe();
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la redirection vers le paiement:', error);
    throw error;
  }
}

// Vérifier le statut d'une session de paiement
export async function checkSessionStatus(sessionId) {
  try {
    const { data, error } = await supabase.functions.invoke('check-session-status', {
      body: { sessionId }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la vérification du statut de la session:', error);
    throw error;
  }
}

// Gérer le retour du paiement
export async function handlePaymentReturn() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (sessionId) {
    try {
      // Afficher un indicateur de chargement
      showLoading('Vérification de votre paiement...');
      
      // Vérifier le statut de la session
      const session = await checkSessionStatus(sessionId);
      
      if (session.payment_status === 'paid') {
        // Paiement réussi
        showSuccess('Paiement réussi ! Mise à jour de votre compte...');
        
        // Rafraîchir les données utilisateur
        await supabase.auth.refreshSession();
        
        // Rediriger vers la page de succès après un court délai
        setTimeout(() => {
          window.location.href = '/account?payment=success';
        }, 2000);
      } else {
        // Paiement non finalisé
        showError('Votre paiement n\'a pas encore été traité. Nous mettrons à jour votre compte dès réception du paiement.');
      }
    } catch (error) {
      console.error('Erreur lors du traitement du retour de paiement:', error);
      showError('Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer ou nous contacter.');
    }
  }
}

// Afficher un message de chargement
function showLoading(message) {
  // Implémentez l'affichage d'un indicateur de chargement
  console.log('Chargement:', message);
}

// Afficher un message de succès
function showSuccess(message) {
  // Implémentez l'affichage d'un message de succès
  console.log('Succès:', message);
}

// Afficher un message d'erreur
function showError(message) {
  // Implémentez l'affichage d'un message d'erreur
  console.error('Erreur:', message);
}

// Initialiser le gestionnaire de paiement
export function initPaymentHandlers() {
  // Gérer le retour de paiement au chargement de la page
  if (window.location.pathname === '/success') {
    handlePaymentReturn();
  }
  
  // Gérer les clics sur les boutons d'achat
  document.addEventListener('click', async (e) => {
    const buyButton = e.target.closest('[data-buy-template]');
    if (buyButton) {
      e.preventDefault();
      
      const templateId = buyButton.getAttribute('data-buy-template');
      const isPremium = buyButton.getAttribute('data-is-premium') === 'true';
      
      try {
        // Afficher un indicateur de chargement
        const originalText = buyButton.innerHTML;
        buyButton.disabled = true;
        buyButton.innerHTML = 'Traitement...';
        
        // Créer une session de paiement
        const { sessionId } = await createCheckoutSession(
          isPremium ? 'premium_plan' : `template_${templateId}`,
          templateId
        );
        
        // Rediriger vers la page de paiement Stripe
        await redirectToCheckout(sessionId);
        
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du paiement:', error);
        showError('Une erreur est survenue lors de l\'initialisation du paiement. Veuillez réessayer.');
        
        // Réactiver le bouton
        buyButton.disabled = false;
        buyButton.innerHTML = originalText;
      }
    }
  });
}

// Exporter une instance globale pour un accès facile
window.StripeHandler = {
  loadStripe,
  createCheckoutSession,
  redirectToCheckout,
  checkSessionStatus,
  handlePaymentReturn,
  initPaymentHandlers
};

// Initialiser les gestionnaires de paiement au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  initPaymentHandlers();
});
