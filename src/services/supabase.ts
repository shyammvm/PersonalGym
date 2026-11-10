import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Environment variables or fallback
const defaultUrl = import.meta.env.VITE_SUPABASE_URL || '';
const defaultKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let clientInstance: SupabaseClient | null = null;
let currentConfig = {
  url: defaultUrl,
  key: defaultKey
};

export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  const url = customUrl || currentConfig.url || localStorage.getItem('irontrack_supabase_url') || '';
  const key = customKey || currentConfig.key || localStorage.getItem('irontrack_supabase_key') || '';

  if (!url || !key) {
    return null;
  }

  if (!clientInstance || currentConfig.url !== url || currentConfig.key !== key) {
    try {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      currentConfig = { url, key };
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return clientInstance;
}

export function updateSupabaseConfig(url: string, key: string): boolean {
  try {
    localStorage.setItem('irontrack_supabase_url', url);
    localStorage.setItem('irontrack_supabase_key', key);
    currentConfig = { url, key };
    if (url && key) {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    } else {
      clientInstance = null;
    }
    return true;
  } catch {
    return false;
  }
}

// Authentication helpers
export async function getCurrentUser(): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data: { user } } = await client.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function signInWithEmail(email: string, password: string) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase not configured. Add Project URL and Anon Key in Settings.');
  return await client.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase not configured. Add Project URL and Anon Key in Settings.');
  return await client.auth.signUp({ email, password });
}

export async function signOutUser() {
  const client = getSupabaseClient();
  if (!client) return;
  return await client.auth.signOut();
}
