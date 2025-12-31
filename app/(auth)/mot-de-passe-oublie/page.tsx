'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SupabaseSetupCard } from '@/components/setup/supabase-setup-card';
import { Mail, ArrowLeft } from 'lucide-react';

export default function MotDePasseOubliePage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const supabase = configured ? createClient() : null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  if (!configured) {
    return <SupabaseSetupCard />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error("Supabase n'est pas configuré.");
      }

      // Envoyer l'email de réinitialisation
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/nouveau-mot-de-passe`,
      });

      if (resetError) {
        // Même si l'email n'existe pas, on affiche un message de succès pour la sécurité
        // (pour éviter de révéler quels emails sont enregistrés)
        if (resetError.message?.toLowerCase().includes('rate limit') || 
            resetError.message?.toLowerCase().includes('too many')) {
          setError('⏱️ Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.');
          return;
        }
        // Pour les autres erreurs, on affiche quand même un message de succès
        // pour ne pas révéler si l'email existe ou non
        setSuccess(true);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      // En cas d'erreur, on affiche quand même un message de succès
      // pour ne pas révéler si l'email existe ou non
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Mot de passe oublié ?
          </CardTitle>
          <CardDescription className="text-center">
            {success 
              ? 'Un email de réinitialisation a été envoyé'
              : 'Entrez votre email pour recevoir un lien de réinitialisation'
            }
          </CardDescription>
        </CardHeader>

        {success ? (
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-sm">
              <p className="font-medium mb-2">✅ Email envoyé !</p>
              <p>
                Si un compte existe avec l'adresse <strong>{email}</strong>, 
                vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
              </p>
              <p className="mt-3 text-xs text-green-700">
                💡 Vérifiez votre boîte de réception et le dossier spam.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="w-full"
              >
                Envoyer un autre email
              </Button>
              <Link href="/connexion" className="w-full">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="moussa@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Vous recevrez un lien pour créer un nouveau mot de passe.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </Button>
              <Link href="/connexion" className="text-sm text-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 inline mr-1" />
                Retour à la connexion
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
