'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function UpgradeErrorPage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto py-8">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-500 p-4">
                <XCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-red-700">
              Paiement échoué
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 mb-2">
                Votre paiement n'a pas pu être traité.
              </p>
              <p className="text-sm text-gray-600">
                Le paiement a été refusé ou annulé. Veuillez vérifier vos informations ou essayer un autre mode de paiement.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/upgrade" className="flex-1">
                <Button className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer le paiement
                </Button>
              </Link>
              <Link href="/profil" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour au profil
                </Button>
              </Link>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">
                Besoin d'aide ?
              </p>
              <p className="text-sm text-blue-700">
                Si le problème persiste, contactez le support ou essayez un autre mode de paiement.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
