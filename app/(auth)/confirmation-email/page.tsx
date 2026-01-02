'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { SupabaseSetupCard } from '@/components/setup/supabase-setup-card';

function ConfirmationEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const configured = isSupabaseConfigured();
  const supabase = configured ? createClient() : null;

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!configured || !supabase) {
      return;
    }

    // Récupérer les paramètres de l'URL
    const emailParam = searchParams.get('email');
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Gérer les erreurs dans l'URL (lien expiré, etc.)
    if (errorParam) {
      setStatus('error');
      if (errorParam === 'otp_expired' || errorDescription?.includes('expired')) {
        setError('Le lien de confirmation a expiré. Veuillez demander un nouvel email de confirmation.');
      } else if (errorParam === 'access_denied') {
        setError('Le lien de confirmation est invalide ou a expiré. Veuillez demander un nouvel email.');
      } else {
        setError(errorDescription || 'Une erreur est survenue lors de la confirmation de votre email.');
      }
      if (emailParam) {
        setEmail(emailParam);
      }
      return;
    }

    if (emailParam) {
      setEmail(emailParam);
    }

    // Si on a un token dans l'URL, Supabase a déjà confirmé l'email automatiquement
    // On vérifie juste l'état de confirmation
    if (token && type) {
      // Attendre un peu pour que Supabase traite la confirmation
      setTimeout(() => {
        checkEmailStatus();
      }, 1000);
    } else {
      // Sinon, vérifier l'état de la session directement
      checkEmailStatus();
    }
  }, [searchParams, supabase, configured]);

  const checkEmailStatus = async () => {
    if (!supabase) return;
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        // Si on ne peut pas récupérer l'utilisateur, on reste en pending
        // car l'utilisateur n'est peut-être pas encore connecté
        setStatus('pending');
        // Essayer de récupérer l'email depuis les paramètres de l'URL
        const emailParam = searchParams.get('email');
        if (emailParam && !email) {
          setEmail(emailParam);
        }
        return;
      }
      
      if (user?.email_confirmed_at) {
        setStatus('success');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 2000);
      } else {
        setStatus('pending');
        if (user?.email && !email) {
          setEmail(user.email);
        }
        // Si on n'a pas d'email, essayer de le récupérer depuis les paramètres de l'URL
        if (!email && !user?.email) {
          const emailParam = searchParams.get('email');
          if (emailParam) {
            setEmail(emailParam);
          }
        }
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Une erreur est survenue');
    }
  };

  const handleResendEmail = async () => {
    if (!email || !supabase) {
      setError('Email non disponible. Veuillez vous réinscrire.');
      return;
    }

    setError(null);
    setStatus('loading');

    try {
      // Essayer d'abord avec resend pour les utilisateurs existants
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/confirmation-email?email=${encodeURIComponent(email)}` : undefined,
        },
      });

      if (resendError) {
        // Si resend échoue, essayer de se connecter puis renvoyer
        // ou simplement afficher un message d'erreur plus clair
        if (resendError.message?.includes('rate limit') || resendError.message?.includes('too many')) {
          setError('Trop de tentatives. Veuillez attendre quelques minutes avant de réessayer.');
        } else if (resendError.message?.includes('not found') || resendError.message?.includes('does not exist')) {
          setError('Cet email n\'est pas enregistré. Veuillez vous inscrire à nouveau.');
        } else {
          setError(resendError.message || 'Erreur lors de l\'envoi de l\'email. Vérifiez que l\'email est correct.');
        }
        setStatus('error');
        return;
      }

      setError(null);
      setStatus('pending');
      // Afficher un message de succès
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = '✅ Email de confirmation renvoyé ! Vérifiez votre boîte de réception.';
      document.body.appendChild(successMessage);
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
      setStatus('error');
    }
  };

  if (!configured) {
    return <SupabaseSetupCard />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold">Vérification en cours...</CardTitle>
              <CardDescription>
                Nous vérifions votre email de confirmation
              </CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-emerald-600">Email confirmé !</CardTitle>
              <CardDescription>
                Votre compte a été activé avec succès. Redirection en cours...
              </CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">Erreur de confirmation</CardTitle>
              <CardDescription className="text-center">
                {error || 'Une erreur est survenue lors de la confirmation de votre email'}
              </CardDescription>
              {error?.includes('expiré') && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  <p className="font-semibold">💡 Le lien a expiré ?</p>
                  <p className="mt-1">Les liens de confirmation expirent après 24 heures. Demandez un nouvel email ci-dessous.</p>
                </div>
              )}
            </>
          )}

          {status === 'pending' && (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Confirmez votre email</CardTitle>
              <CardDescription>
                {email 
                  ? `Nous avons envoyé un email de confirmation à ${email}. Cliquez sur le lien dans l'email pour activer votre compte.`
                  : 'Un email de confirmation vous a été envoyé. Cliquez sur le lien dans l\'email pour activer votre compte.'}
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'pending' && email && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-2">💡 Astuce :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Vérifiez votre dossier spam/courrier indésirable</li>
                  <li>Le lien de confirmation expire après 24 heures</li>
                  <li>Vous pouvez demander un nouvel email si nécessaire</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                >
                  Renvoyer l'email de confirmation
                </Button>
                <Link href="/connexion" className="w-full">
                  <Button variant="ghost" className="w-full">
                    Retour à la connexion
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <div className="flex flex-col gap-3">
              {email && (
                <Button 
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                >
                  Renvoyer l'email de confirmation
                </Button>
              )}
              <Link href="/connexion" className="w-full">
                <Button variant="ghost" className="w-full">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmationEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
            <CardTitle>Chargement...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <ConfirmationEmailContent />
    </Suspense>
  );
}
