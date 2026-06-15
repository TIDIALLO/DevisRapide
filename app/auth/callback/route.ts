import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Route GET /auth/callback
 *
 * Quand un utilisateur clique sur un lien Supabase (confirmation email,
 * réinitialisation de mot de passe, magic link…), Supabase le redirige ici
 * avec un paramètre `code` (PKCE flow) ou `token_hash` + `type`.
 *
 * Cette route échange le code/token contre une vraie session (cookies),
 * puis redirige l'utilisateur vers la bonne page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // PKCE flow — le paramètre principal
  const code = searchParams.get('code');
  // Ancien flow (token hash) — fallback
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  // Page de redirection après succès (optionnelle)
  const next = searchParams.get('next') ?? '/dashboard';

  // Créer une réponse de redirection par défaut (sera modifiée ci-dessous)
  const redirectTo = new URL(next, origin);

  // Préparer le client Supabase côté serveur avec gestion des cookies
  const response = NextResponse.redirect(redirectTo);

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ??
    process.env.SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    process.env.SUPABASE_ANON_KEY?.trim() ??
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !key) {
    // Supabase pas configuré, rediriger vers setup
    return NextResponse.redirect(new URL('/setup', origin));
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // --- Cas 1 : PKCE flow (le plus courant avec @supabase/ssr) ---
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[auth/callback] Erreur échange code:', error.message);
      // Rediriger vers connexion avec un message d'erreur
      const errorUrl = new URL('/connexion', origin);
      errorUrl.searchParams.set('error', 'auth_callback_failed');
      return NextResponse.redirect(errorUrl);
    }

    // Si c'est une réinitialisation de mot de passe, rediriger vers la page
    // de changement de mot de passe (pas le dashboard)
    if (type === 'recovery' || next === '/nouveau-mot-de-passe') {
      return NextResponse.redirect(new URL('/nouveau-mot-de-passe', origin));
    }

    // Si c'est une confirmation d'email
    if (type === 'signup' || type === 'email') {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email || '';
      const confirmUrl = new URL('/connexion', origin);
      confirmUrl.searchParams.set('email_confirmed', 'true');
      if (email) confirmUrl.searchParams.set('email', email);
      return NextResponse.redirect(confirmUrl);
    }

    // Succès : rediriger vers la page demandée
    return response;
  }

  // --- Cas 2 : Token hash (ancien flow, emails de type "recovery") ---
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (error) {
      console.error('[auth/callback] Erreur vérification OTP:', error.message);
      const errorUrl = new URL('/connexion', origin);
      errorUrl.searchParams.set('error', 'token_invalid');
      return NextResponse.redirect(errorUrl);
    }

    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/nouveau-mot-de-passe', origin));
    }

    if (type === 'signup' || type === 'email') {
      const confirmUrl = new URL('/connexion', origin);
      confirmUrl.searchParams.set('email_confirmed', 'true');
      return NextResponse.redirect(confirmUrl);
    }

    return response;
  }

  // --- Aucun code ni token → retour connexion ---
  console.warn('[auth/callback] Ni code ni token_hash trouvés dans l\'URL');
  return NextResponse.redirect(new URL('/connexion', origin));
}
