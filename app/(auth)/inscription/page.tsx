'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Profession } from '@/types';
import { SupabaseSetupCard } from '@/components/setup/supabase-setup-card';
import { WifiOff } from 'lucide-react';

const professions: { value: Profession; label: string }[] = [
  { value: 'peintre', label: 'Peintre' },
  { value: 'mecanicien', label: 'Mécanicien' },
  { value: 'quincaillier', label: 'Quincaillier' },
  { value: 'electricien', label: 'Électricien' },
  { value: 'plombier', label: 'Plombier' },
  { value: 'autre', label: 'Autre' },
];

export default function InscriptionPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const supabase = useMemo(() => (configured ? createClient() : null), [configured]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    profession: 'peintre' as Profession,
    password: '',
    confirmPassword: '',
  });

  // Important: si Supabase n'est pas configuré, on affiche une page de setup
  // au lieu de crasher.
  if (!configured) {
    return <SupabaseSetupCard />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        throw new Error("Supabase n'est pas configuré. Vérifie `devisrapide/.env.local` puis redémarre `npm run dev`.");
      }
      // 1. Créer le compte auth
      // IMPORTANT: Même si la confirmation email est activée, signUp() envoie toujours l'email
      // si l'option est activée dans Supabase Dashboard
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
          // Rediriger vers /auth/callback qui échangera le code PKCE
          // puis redirigera vers la page de connexion avec email_confirmed=true
          emailRedirectTo: typeof window !== 'undefined' 
            ? `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`
            : undefined,
        },
      });

      if (authError) {
        // Gérer l'erreur d'email déjà existant avec un message professionnel
        if (authError.message?.includes('already registered') || 
            authError.message?.includes('already exists') ||
            authError.message?.includes('User already registered') ||
            authError.message?.toLowerCase().includes('email')) {
          throw new Error('📧 Cet email est déjà associé à un compte. Si vous avez déjà un compte, connectez-vous. Sinon, utilisez une autre adresse email.');
        }
        // Autres erreurs avec messages personnalisés
        if (authError.message?.includes('password')) {
          throw new Error('🔒 Le mot de passe ne respecte pas les critères de sécurité requis.');
        }
        if (authError.message?.includes('rate limit') || authError.message?.includes('too many')) {
          throw new Error('⏱️ Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.');
        }
        throw new Error(`❌ ${authError.message || 'Une erreur est survenue lors de la création de votre compte. Veuillez réessayer.'}`);
      }
      const userId = authData.user?.id;
      if (!userId) throw new Error('Erreur lors de la création du compte');

      // Vérifier si l'email nécessite une confirmation
      // Si l'email n'est pas confirmé, rediriger vers la page de confirmation
      // Note: Même si la confirmation est désactivée dans Supabase, on redirige quand même
      // pour informer l'utilisateur et permettre de renvoyer l'email si nécessaire
      if (!authData.user?.email_confirmed_at) {
        // L'email de confirmation devrait avoir été envoyé automatiquement par Supabase
        // Rediriger vers la page de confirmation
        router.push(`/confirmation-email?email=${encodeURIComponent(formData.email)}`);
        return;
      }

      // 2. Créer le profil utilisateur via fonction RPC (contourne RLS)
      const { data: profileData, error: profileError } = await supabase.rpc('create_user_profile' as any, {
        p_user_id: userId,
        p_email: formData.email,
        p_phone: formData.phone,
        p_full_name: formData.fullName,
        p_profession: formData.profession,
        p_address: formData.address || null,
      });

      if (profileError) {
        if (profileError.message?.includes('duplicate key') ||
            profileError.message?.includes('users_email_key') ||
            profileError.message?.includes('users_phone_key') ||
            profileError.message?.includes('email est déjà utilisé') ||
            profileError.code === '23505') {
          throw new Error('📧 Cet email ou ce numéro de téléphone est déjà associé à un compte. Si vous avez déjà un compte, connectez-vous. Sinon, utilisez une autre adresse email ou un autre numéro.');
        }
        // Gérer l'erreur d'ambiguïté de fonction SQL
        if (profileError.message?.includes('could not choose') || 
            profileError.message?.includes('ambiguous') ||
            profileError.message?.includes('best candidate')) {
          throw new Error('⚠️ Erreur technique temporaire. Veuillez réessayer dans quelques instants. Si le problème persiste, contactez le support.');
        }
        throw new Error(`❌ ${profileError.message || 'Une erreur est survenue lors de la création de votre profil. Veuillez réessayer.'}`);
      }

      // 3. Attendre que la session soit établie (nécessaire pour RLS)
      // Après signUp(), la session peut ne pas être immédiatement disponible
      let session = authData.session;
      if (!session) {
        // Attendre un peu et réessayer de récupérer la session
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const { data: { session: newSession } } = await supabase.auth.getSession();
        session = newSession;
      }

      // 4. Importer le catalogue template (optionnel, ne bloque pas l'inscription)
      try {
        const { CATALOG_TEMPLATES } = await import('@/lib/templates/catalog-templates');
        const templates = CATALOG_TEMPLATES[formData.profession].map((item) => ({
          user_id: userId,
          name: item.name,
          description: item.description || null,
          unit_price: item.unit_price,
          unit: item.unit,
          category: item.category || null,
          is_template: false,
        }));

        if (templates.length > 0) {
          // Vérifier d'abord que la table existe en faisant un SELECT simple
          const { error: checkError } = await supabase
            .from('catalog_items')
            .select('id')
            .limit(1);

          if (!checkError) {
            // Si la session n'est toujours pas disponible, utiliser la fonction RPC
            if (!session) {
              // Utiliser la fonction RPC qui contourne RLS
              // Convertir les templates en JSONB (sans user_id car il est passé séparément)
              const itemsForRpc = templates.map(({ user_id: _uid, ...rest }) => rest);
              await (supabase.rpc as any)('import_catalog_items', { p_user_id: userId, p_items: itemsForRpc });
            } else {
              // La session est disponible, on peut utiliser INSERT normal
              await supabase.from('catalog_items').insert(templates).select();
            }
          }
        }
      } catch {
        // Import catalogue non-critique, ne bloque pas l'inscription
      }

      // 4. Si l'email est déjà confirmé (peu probable mais possible), rediriger vers le dashboard
      // Sinon, on a déjà redirigé vers la page de confirmation plus haut
      if (authData.user?.email_confirmed_at) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      // Détecter les erreurs réseau
      if (
        err.message === 'Failed to fetch' ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('net::ERR') ||
        (err.name === 'TypeError' && !err.message?.includes('Cannot'))
      ) {
        setError('Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez.');
      } else {
        const errorMessage = err.message || 'Une erreur est survenue lors de la création de votre compte.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Créer un compte</CardTitle>
          <CardDescription className="text-center">
            Commencez à créer des devis professionnels en moins de 3 minutes
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
                {error.includes('connexion internet') && <WifiOff className="h-4 w-4 mt-0.5 shrink-0" />}
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                placeholder="Moussa Diallo"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

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
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+221 77 123 45 67"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse de l'entreprise</Label>
              <Input
                id="address"
                placeholder="Ex: Dakar, Sénégal"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profession">Métier</Label>
              <Select
                value={formData.profession}
                onValueChange={(value) => setFormData({ ...formData, profession: value as Profession })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {professions.map((prof) => (
                    <SelectItem key={prof.value} value={prof.value}>
                      {prof.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Déjà un compte ?{' '}
              <Link href="/connexion" className="text-primary hover:underline">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

