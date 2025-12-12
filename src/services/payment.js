import { supabase } from '../config/supabase';

// Prix des templates (en centimes)
const PRICES = {
  SINGLE_TEMPLATE: 289, // 2.89€
  ALL_TEMPLATES: 979,   // 9.79€
};

// Créer une session de paiement Stripe
export const createCheckoutSession = async (templateId = 'all') => {
  const priceId = templateId === 'all' ? PRICES.ALL_TEMPLATES : PRICES.SINGLE_TEMPLATE;
  
  const { data: { session }, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { 
      priceId,
      templateId,
      successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/pricing`
    }
  });
  
  if (error) {
    console.error('Erreur lors de la création de la session de paiement:', error.message);
    throw error;
  }
  
  // Rediriger vers Stripe Checkout
  window.location.href = session.url;
};

// Vérifier si un utilisateur a accès à un template
export const hasAccessToTemplate = async (templateId) => {
  const { data, error } = await supabase
    .from('user_templates')
    .select('*')
    .eq('template_id', templateId)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 = aucun résultat
    console.error('Erreur lors de la vérification de l\'accès:', error.message);
    return false;
  }
  
  return !!data;
};

// Vérifier si un utilisateur a accès à tous les templates
export const hasFullAccess = async () => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('status')
    .eq('status', 'active')
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error('Erreur lors de la vérification de l\'accès complet:', error.message);
    return false;
  }
  
  return !!data;
};

// Récupérer l'historique des paiements
export const getPaymentHistory = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Erreur lors de la récupération de l\'historique des paiements:', error.message);
    throw error;
  }
  
  return data;
};
