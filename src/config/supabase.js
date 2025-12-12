// Configuration de Supabase
export const SUPABASE_URL = 'https://frqpbfbhdruailxlbjfw.supabase.co';
// La clé API publique est sécurisée à utiliser dans le frontend
export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // À remplacer par votre clé anon

// Initialisation de Supabase
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
