import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Package, Plus, TrendingUp, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  // Récupérer le profil
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Statistiques du mois - Requêtes optimisées en parallèle
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Requêtes en parallèle pour améliorer les performances
  const [quotesResult, clientsResult, catalogResult] = await Promise.all([
    supabase
      .from('quotes')
      .select('id, total, status, date', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('date', startOfMonth.toISOString()),
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('catalog_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ]);

  const quotes = quotesResult.data || [];
  const clientsCount = clientsResult.count || 0;
  const catalogCount = catalogResult.count || 0;

  // Calculs
  const thisMonthQuotes = quotes?.length || 0;
  const thisMonthTotal = quotes?.reduce((sum, q) => sum + Number(q.total), 0) || 0;
  const acceptedQuotes = quotes?.filter((q) => q.status === 'accepted').length || 0;
  const acceptanceRate = thisMonthQuotes > 0 ? (acceptedQuotes / thisMonthQuotes) * 100 : 0;

  // Devis récents - Requête optimisée (seulement les colonnes nécessaires)
  const { data: recentQuotes } = await supabase
    .from('quotes')
    .select('id, quote_number, total, status, created_at, valid_until, client:clients(id, full_name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const isPro = profile?.plan === 'pro';

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-20 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour, {profile?.full_name || 'Artisan'} 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Bienvenue sur votre tableau de bord
            </p>
          </div>
          <Link href="/devis/nouveau">
            <Button size="lg" className="w-full sm:w-auto">
              <Plus className="w-5 h-5 mr-2" />
              Nouveau devis
            </Button>
          </Link>
        </div>

        {/* Plan Badge */}
        {!isPro && (
          <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Plan Gratuit</h3>
                  <p className="text-blue-100">
                    Vous avez créé {thisMonthQuotes}/5 devis ce mois-ci
                  </p>
                </div>
                <Link href="/profil#upgrade">
                  <Button variant="secondary" size="lg">
                    Passer PRO
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Devis ce mois
              </CardTitle>
              <FileText className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisMonthQuotes}</div>
              <p className="text-xs text-gray-600 mt-1">
                {acceptedQuotes} acceptés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Montant total
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(thisMonthTotal)}</div>
              <p className="text-xs text-gray-600 mt-1">
                {acceptanceRate.toFixed(0)}% taux d'acceptation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Clients
              </CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientsCount || 0}</div>
              <Link href="/clients" className="text-xs text-primary hover:underline mt-1 inline-block">
                Gérer les clients →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Catalogue
              </CardTitle>
              <Package className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{catalogCount || 0}</div>
              <Link href="/catalogue" className="text-xs text-primary hover:underline mt-1 inline-block">
                Voir le catalogue →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Quotes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Devis récents</CardTitle>
                <CardDescription>Vos 5 derniers devis créés</CardDescription>
              </div>
              <Link href="/devis">
                <Button variant="outline" size="sm">Voir tout</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentQuotes && recentQuotes.length > 0 ? (
              <div className="space-y-4">
                {recentQuotes.map((quote) => (
                  <Link key={quote.id} href={`/devis/${quote.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{quote.quote_number}</div>
                          <div className="text-sm text-gray-600">
                            {quote.client?.full_name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(Number(quote.total))}</div>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                          quote.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          quote.status === 'refused' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {quote.status === 'draft' ? 'Brouillon' :
                           quote.status === 'sent' ? 'Envoyé' :
                           quote.status === 'accepted' ? 'Accepté' :
                           quote.status === 'refused' ? 'Refusé' :
                           'Expiré'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Aucun devis</p>
                <p className="mb-4">Créez votre premier devis maintenant</p>
                <Link href="/devis/nouveau">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un devis
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

