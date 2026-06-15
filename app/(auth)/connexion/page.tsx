'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SupabaseSetupCard } from '@/components/setup/supabase-setup-card';
import { WifiOff } from 'lucide-react';

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const configured = isSupabaseConfigured();
  const supabase = useMemo(() => (configured ? createClient() : null), [configured]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Vérifier si on vient d'une réinitialisation, confirmation, ou erreur auth callback
  useEffect(() => {
    if (searchParams.get('password_reset') === 'success') {
      setSuccess('✅ Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.');
      router.replace('/connexion', { scroll: false });
    } else if (searchParams.get('email_confirmed') === 'true') {
      const confirmedEmail = searchParams.get('email');
      setSuccess(`✅ Votre email ${confirmedEmail ? `(${confirmedEmail})` : ''} a été confirmé avec succès ! Vous pouvez maintenant vous connecter.`);
      if (confirmedEmail) {
        setFormData(prev => ({ ...prev, email: confirmedEmail }));
      }
      router.replace('/connexion', { scroll: false });
    } else if (searchParams.get('error') === 'auth_callback_failed') {
      setError('Le lien a expiré ou est invalide. Veuillez réessayer.');
      router.replace('/connexion', { scroll: false });
    } else if (searchParams.get('error') === 'token_invalid') {
      setError('Le lien de réinitialisation est invalide ou a déjà été utilisé.');
      router.replace('/connexion', { scroll: false });
    }
  }, [searchParams, router]);

  // Important: si Supabase n'est pas configuré, on affiche une page de setup
  // au lieu de crasher (erreur visible sur la capture).
  if (!configured) {
    return <SupabaseSetupCard />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error("Supabase n'est pas configuré. Vérifie `devisrapide/.env.local` puis redémarre `npm run dev`.");
      }
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        // Message d'erreur professionnel pour l'email non confirmé
        if (signInError.message?.toLowerCase().includes('email not confirmed') || 
            signInError.message?.toLowerCase().includes('email_not_confirmed')) {
          setError('📧 Votre email n\'est pas encore confirmé. Veuillez vérifier votre boîte de réception (et le dossier spam) et cliquer sur le lien de confirmation. Vous serez redirigé vers la page de confirmation...');
          // Rediriger vers la page de confirmation
          setTimeout(() => {
            router.push(`/confirmation-email?email=${encodeURIComponent(formData.email)}`);
          }, 2000);
          return;
        }
        // Message pour mauvais identifiants
        if (signInError.message?.toLowerCase().includes('invalid') || 
            signInError.message?.toLowerCase().includes('credentials')) {
          setError('🔒 Email ou mot de passe incorrect. Vérifiez vos identifiants et réessayez.');
          return;
        }
        // Message pour rate limit
        if (signInError.message?.toLowerCase().includes('rate limit') || 
            signInError.message?.toLowerCase().includes('too many')) {
          setError('⏱️ Trop de tentatives de connexion. Veuillez patienter quelques minutes avant de réessayer.');
          return;
        }
        throw signInError;
      }

      // Vérifier si l'email est confirmé même si la connexion a réussi
      // (au cas où la confirmation serait désactivée côté Supabase mais qu'on veut quand même la vérifier)
      if (signInData.user && !signInData.user.email_confirmed_at) {
        setError('📧 Votre email n\'est pas encore confirmé. Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation.');
        router.push(`/confirmation-email?email=${encodeURIComponent(formData.email)}`);
        return;
      }

      // Attendre que la session soit bien stockée dans les cookies
      // avant de rediriger
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: { session: finalSession } } = await supabase.auth.getSession();
      if (!finalSession) {
        setError('⚠️ Problème de session. Veuillez réessayer.');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      // Détecter les erreurs réseau (DNS non résolu, pas d'internet, serveur injoignable)
      if (
        err.message === 'Failed to fetch' ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('net::ERR') ||
        err.name === 'TypeError' && !err.message?.includes('Cannot')
      ) {
        setError('Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez.');
      } else {
        setError(err.message || 'Une erreur est survenue lors de la connexion. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous pour accéder à votre espace
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md text-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
                {error.includes('connexion internet') && <WifiOff className="h-4 w-4 mt-0.5 shrink-0" />}
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="moussa@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link 
                  href="/mot-de-passe-oublie" 
                  className="text-xs text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
            <div className="text-sm text-center space-y-2">
              <p className="text-muted-foreground">
                Pas encore de compte ?{' '}
                <Link href="/inscription" className="text-primary hover:underline">
                  S'inscrire
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ConnexionForm />
    </Suspense>
  );
}
