import { supabase } from '../config/supabase';

// Enregistrement avec email et envoi du magic link
export const signUp = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + '/auth/callback',
    },
  });
  
  if (error) {
    console.error('Erreur lors de l\'inscription:', error.message);
    throw error;
  }
  
  return data;
};

// Connexion avec email (envoi du magic link)
export const signIn = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + '/auth/callback',
    },
  });
  
  if (error) {
    console.error('Erreur lors de la connexion:', error.message);
    throw error;
  }
  
  return data;
};

// Déconnexion
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erreur lors de la déconnexion:', error.message);
    throw error;
  }
};

// Vérifie si l'utilisateur est connecté
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error.message);
    throw error;
  }
  
  return user;
};

// Écoute les changements d'état d'authentification
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user || null);
  });
};
