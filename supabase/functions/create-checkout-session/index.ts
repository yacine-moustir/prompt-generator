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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction principale du serveur
serve(async (req) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Créer un client Supabase avec les en-têtes d'autorisation
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Vérifier que l'utilisateur est authentifié
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Récupérer les données de la requête
    const { priceId, templateId, successUrl, cancelUrl } = await req.json();

    if (!priceId || !templateId) {
      return new Response(
        JSON.stringify({ error: 'ID de prix ou de template manquant' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Vérifier si l'utilisateur a déjà acheté ce template
    const { data: existingPurchase, error: purchaseError } = await supabaseClient
      .from('user_templates')
      .select('*')
      .eq('user_id', user.id)
      .eq('template_id', templateId)
      .single();

    if (purchaseError && purchaseError.code !== 'PGRST116') { // PGRST116 = aucun résultat
      console.error('Erreur lors de la vérification des achats existants:', purchaseError);
      throw purchaseError;
    }

    if (existingPurchase) {
      return new Response(
        JSON.stringify({ 
          error: 'Vous avez déjà acheté ce template',
          sessionId: null
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Créer une session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${Deno.env.get('SITE_URL')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${Deno.env.get('SITE_URL')}/pricing?cancelled=true`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        userEmail: user.email || '',
        templateId,
      },
    });

    // Enregistrer la session de paiement dans la base de données
    const { error: dbError } = await supabaseClient
      .from('payments')
      .insert([
        {
          user_id: user.id,
          session_id: session.id,
          template_id: templateId,
          amount: session.amount_total ? session.amount_total / 100 : 0, // Convertir en euros
          currency: session.currency || 'eur',
          status: 'pending',
        },
      ]);

    if (dbError) {
      console.error('Erreur lors de l\'enregistrement de la session de paiement:', dbError);
      throw dbError;
    }

    // Retourner l'ID de session au client
    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Une erreur est survenue lors de la création de la session de paiement.' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
