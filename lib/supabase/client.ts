import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

function isValidHttpUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  // Supabase a renommé "anon public" → "publishable" dans certains dashboards.
  // On supporte les deux pour éviter les erreurs de configuration.
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  return { url, key };
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabasePublicEnv();
  return isValidHttpUrl(url) && Boolean(key);
}

export const createClient = (): SupabaseClient<Database, 'public'> => {
  const { url, key } = getSupabasePublicEnv();
  if (!isValidHttpUrl(url) || !key) {
    // Pendant le build / prerender, Next peut évaluer des modules côté serveur.
    // On évite de faire échouer le build si l'env n'est pas encore configuré.
    if (typeof window === 'undefined') {
      return null as unknown as ReturnType<typeof createBrowserClient<Database>>;
    }

    const hint =
      url?.startsWith('sb_') || url?.includes('publishable')
        ? "Astuce: tu as inversé les valeurs. `NEXT_PUBLIC_SUPABASE_URL` doit être une URL (ex: https://xxxx.supabase.co) et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` doit contenir `sb_publishable_...`."
        : url?.startsWith('eyJ')
          ? "Astuce: tu as mis une clé JWT dans `NEXT_PUBLIC_SUPABASE_URL`. L'URL doit ressembler à `https://<project-ref>.supabase.co`."
          : undefined;

    throw new Error(
      [
        "Supabase n'est pas configuré (ou l'URL est invalide).",
        "Crée `devisrapide/.env.local` avec NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co et NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY), puis redémarre `npm run dev`.",
        hint,
      ]
        .filter(Boolean)
        .join(' ')
    );
  }

  // IMPORTANT: createBrowserClient de @supabase/ssr gère AUTOMATIQUEMENT les cookies
  // Ne pas surcharger avec une gestion manuelle qui peut causer des conflits
  // Le client utilise automatiquement les cookies du navigateur pour la session
  return createBrowserClient<Database>(url, key) as SupabaseClient<Database, 'public'>;
};

