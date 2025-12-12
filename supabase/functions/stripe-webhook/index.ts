// Importation des dépendances
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Stripe from 'https://esm.sh/stripe@12.0.0';

// Configuration de Stripe avec la clé secrète
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-08-16',
  httpClient: Stripe.createFetchHttpClient()
});

// Configuration CORS pour les requêtes cross-origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// Fonction principale du serveur
serve(async (req) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Récupérer la signature Stripe de l'en-tête
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('Signature Stripe manquante');
    }

    // Récupérer le corps de la requête comme texte brut
    const body = await req.text();
    
    // Vérifier la signature du webhook
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Clé secrète du webhook non configurée');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error(`Erreur de signature du webhook: ${err.message}`);
      return new Response(`Erreur de signature du webhook: ${err.message}`, { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Créer un client Supabase admin pour effectuer des opérations côté serveur
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Gérer les types d'événements Stripe
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object, supabaseAdmin);
        break;
      
      case 'checkout.session.async_payment_succeeded':
        await handleAsyncPaymentSucceeded(event.data.object, supabaseAdmin);
        break;
      
      case 'checkout.session.async_payment_failed':
        await handleAsyncPaymentFailed(event.data.object, supabaseAdmin);
        break;
      
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object, supabaseAdmin);
        break;
      
      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur du webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Une erreur est survenue lors du traitement du webhook.' 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

// Gérer l'événement de session de paiement complétée
async function handleCheckoutSessionCompleted(session, supabase) {
  const { id: sessionId, payment_status, metadata, amount_total, currency } = session;
  const userId = metadata?.userId || session.client_reference_id;
  const templateId = metadata?.templateId;

  if (!userId || !templateId) {
    console.error('ID utilisateur ou template manquant dans les métadonnées du webhook');
    return;
  }

  console.log(`Paiement ${payment_status} pour l'utilisateur ${userId}, template: ${templateId}`);

  // Mettre à jour le statut du paiement dans la base de données
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: payment_status,
      amount: amount_total ? amount_total / 100 : 0, // Convertir en euros
      currency: currency || 'eur',
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId);

  if (updateError) {
    console.error('Erreur lors de la mise à jour du paiement:', updateError);
    throw updateError;
  }

  // Si le paiement est réussi, accorder l'accès au template
  if (payment_status === 'paid') {
    await grantTemplateAccess(userId, templateId, sessionId, supabase);
  }
}

// Gérer le succès d'un paiement asynchrone (comme SEPA)
async function handleAsyncPaymentSucceeded(session, supabase) {
  const { id: sessionId } = session;
  
  // Mettre à jour le statut du paiement
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId);

  if (updateError) {
    console.error('Erreur lors de la mise à jour du paiement asynchrone réussi:', updateError);
    throw updateError;
  }

  // Récupérer les détails de la session pour obtenir l'utilisateur et le template
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('user_id, template_id')
    .eq('session_id', sessionId)
    .single();

  if (paymentError || !payment) {
    console.error('Paiement non trouvé:', paymentError);
    return;
  }

  // Accorder l'accès au template
  await grantTemplateAccess(payment.user_id, payment.template_id, sessionId, supabase);
}

// Gérer l'échec d'un paiement asynchrone
async function handleAsyncPaymentFailed(session, supabase) {
  const { id: sessionId } = session;
  
  // Mettre à jour le statut du paiement
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId);

  if (updateError) {
    console.error('Erreur lors de la mise à jour du paiement asynchrone échoué:', updateError);
    throw updateError;
  }
}

// Gérer un remboursement
async function handleChargeRefunded(charge, supabase) {
  const { id: chargeId, payment_intent: paymentIntentId, refunded, amount_refunded, currency } = charge;
  
  if (!refunded) return; // Seulement si le remboursement est total
  
  // Mettre à jour le statut du paiement
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('id, user_id, template_id, amount')
    .eq('payment_intent_id', paymentIntentId)
    .single();

  if (paymentError || !payment) {
    console.error('Paiement non trouvé pour le remboursement:', paymentError);
    return;
  }

  // Mettre à jour le statut du paiement
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'refunded',
      amount_refunded: amount_refunded / 100, // Convertir en euros
      refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('payment_intent_id', paymentIntentId);

  if (updateError) {
    console.error('Erreur lors de la mise à jour du remboursement:', updateError);
    throw updateError;
  }

  // Révoquer l'accès au template si nécessaire
  await revokeTemplateAccess(payment.user_id, payment.template_id, supabase);
}

// Fonction utilitaire pour accorder l'accès à un template
async function grantTemplateAccess(userId, templateId, sessionId, supabase) {
  // Vérifier si c'est un accès complet ou à un template spécifique
  if (templateId === 'all') {
    // Marquer l'utilisateur comme ayant un abonnement premium
    const { error: userError } = await supabase
      .from('user_subscriptions')
      .upsert(
        {
          user_id: userId,
          status: 'active',
          session_id: sessionId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (userError) {
      console.error('Erreur lors de la mise à jour de l\'abonnement utilisateur:', userError);
      throw userError;
    }
  } else {
    // Vérifier si l'utilisateur a déjà accès à ce template
    const { data: existingAccess, error: accessError } = await supabase
      .from('user_templates')
      .select('id')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .maybeSingle();

    if (accessError) {
      console.error('Erreur lors de la vérification de l\'accès existant:', accessError);
      throw accessError;
    }

    // Si l'accès n'existe pas encore, l'ajouter
    if (!existingAccess) {
      const { error: insertError } = await supabase
        .from('user_templates')
        .insert([
          {
            user_id: userId,
            template_id: templateId,
            session_id: sessionId,
            granted_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        console.error('Erreur lors de l\'octroi de l\'accès au template:', insertError);
        throw insertError;
      }
    }
  }

  console.log(`Accès accordé pour l'utilisateur ${userId} au template ${templateId}`);
}

// Fonction utilitaire pour révoquer l'accès à un template
async function revokeTemplateAccess(userId, templateId, supabase) {
  if (templateId === 'all') {
    // Mettre à jour le statut de l'abonnement
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', updateError);
      throw updateError;
    }
  } else {
    // Supprimer l'accès au template spécifique
    const { error: deleteError } = await supabase
      .from('user_templates')
      .delete()
      .eq('user_id', userId)
      .eq('template_id', templateId);

    if (deleteError) {
      console.error('Erreur lors de la révocation de l\'accès au template:', deleteError);
      throw deleteError;
    }
  }

  console.log(`Accès révoqué pour l'utilisateur ${userId} au template ${templateId}`);
}
