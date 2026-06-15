import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isValidHttpUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ??
    process.env.SUPABASE_URL?.trim();
  // Supabase a renommé "anon public" → "publishable" dans certains dashboards.
  // On supporte les deux noms pour éviter les erreurs de configuration.
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    process.env.SUPABASE_ANON_KEY?.trim() ??
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  // Tant que Supabase n'est pas configuré, on évite de crasher le middleware
  // et on guide vers une page de setup.
  if (!isValidHttpUrl(url) || !anonKey) {
    const pathname = req.nextUrl.pathname;
    const setupRoutes = ['/', '/setup'];
    const authRoutes = [
      '/connexion',
      '/inscription',
      '/confirmation-email',
      '/mot-de-passe-oublie',
      '/nouveau-mot-de-passe',
    ];

    if ([...setupRoutes, ...authRoutes].includes(pathname)) {
      return res;
    }

    const redirectUrl = new URL('/setup', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Type assertion: on a déjà vérifié que url et anonKey ne sont pas undefined
  const supabase = createServerClient(url!, anonKey!, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Routes publiques (accessibles sans session)
  const publicRoutes = [
    '/',
    '/setup',
    '/connexion',
    '/inscription',
    '/confirmation-email',
    '/mot-de-passe-oublie',
    '/nouveau-mot-de-passe',
  ];
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);

  // Si pas de session et route protégée, rediriger vers connexion
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/connexion', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Si session et sur page auth, rediriger vers dashboard
  // MAIS seulement si l'email est confirmé
  if (session && (req.nextUrl.pathname === '/connexion' || req.nextUrl.pathname === '/inscription')) {
    // Vérifier que l'email est confirmé avant de rediriger
    if (session.user.email_confirmed_at) {
      const redirectUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(redirectUrl);
    } else {
      // Si l'email n'est pas confirmé, rediriger vers la page de confirmation
      const email = session.user.email;
      if (email) {
        const redirectUrl = new URL(`/confirmation-email?email=${encodeURIComponent(email)}`, req.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Exclure :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation images)
     * - favicon.ico
     * - public/ (fichiers publics)
     * - api/ (routes API, gérées par leurs propres guards)
     * - auth/callback (route de callback Supabase)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api|auth/callback).*)',
  ],
};

