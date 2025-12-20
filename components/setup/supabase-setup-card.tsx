'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SupabaseSetupCard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">
            Configuration Supabase requise
          </CardTitle>
          <p className="text-sm text-gray-600">
            Les variables d&apos;environnement Supabase ne sont pas définies.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="font-semibold">
              1) Crée le fichier{' '}
              <code className="px-1 py-0.5 bg-gray-100 rounded">devisrapide/.env.local</code>
            </p>
            <pre className="whitespace-pre-wrap rounded-lg bg-slate-950 text-slate-50 p-4 text-sm overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
# ou (selon ton dashboard Supabase)
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...`}
            </pre>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">2) Où récupérer ces valeurs ?</p>
            <p className="text-sm text-gray-700">
              Supabase Dashboard → <strong>Settings</strong> → <strong>API</strong> :
              <br />
              - <strong>Project URL</strong> → <code>NEXT_PUBLIC_SUPABASE_URL</code>
              <br />
              - <strong>anon public</strong> key → <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (ou <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>)
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">3) Redémarre le serveur</p>
            <pre className="whitespace-pre-wrap rounded-lg bg-slate-950 text-slate-50 p-4 text-sm overflow-x-auto">
{`# arrêter (Ctrl+C) puis relancer
npm run dev`}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Retour à l&apos;accueil
              </Button>
            </Link>
            <Link href="/connexion" className="flex-1">
              <Button className="w-full">Réessayer la connexion</Button>
            </Link>
          </div>

          <p className="text-xs text-gray-500">
            Important: ne commit jamais <code>.env.local</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


