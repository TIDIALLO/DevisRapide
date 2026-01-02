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
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
              Bonjour, <span className="text-primary">{profile?.full_name || 'Artisan'}</span> 👋
            </h1>
            <p className="text-lg text-gray-700 font-semibold">
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
          <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg md:text-xl mb-1.5 tracking-tight">Plan Gratuit</h3>
                  <p className="text-blue-100 text-sm font-medium">
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
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Devis ce mois
              </CardTitle>
              <FileText className="w-6 h-6 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-white tracking-tight mb-1">{thisMonthQuotes}</div>
              <p className="text-sm text-gray-300 mt-2 font-semibold">
                {acceptedQuotes} acceptés
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Montant total
              </CardTitle>
              <TrendingUp className="w-6 h-6 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-white tracking-tight mb-1">{formatCurrency(thisMonthTotal)}</div>
              <p className="text-sm text-gray-300 mt-2 font-semibold">
                {acceptanceRate.toFixed(0)}% taux d'acceptation
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Clients
              </CardTitle>
              <Users className="w-6 h-6 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-white tracking-tight mb-1">{clientsCount || 0}</div>
              <Link href="/clients" className="text-sm text-blue-400 hover:text-blue-300 hover:underline mt-2 inline-block font-bold transition-colors">
                Gérer les clients →
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Catalogue
              </CardTitle>
              <Package className="w-6 h-6 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-white tracking-tight mb-1">{catalogCount || 0}</div>
              <Link href="/catalogue" className="text-sm text-blue-400 hover:text-blue-300 hover:underline mt-2 inline-block font-bold transition-colors">
                Voir le catalogue →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Quotes */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-white tracking-tight">Devis récents</CardTitle>
                <CardDescription className="text-base text-gray-300 mt-1.5 font-semibold">Vos 5 derniers devis créés</CardDescription>
              </div>
              <Link href="/devis">
                <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  Voir tout
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentQuotes && recentQuotes.length > 0 ? (
              <div className="space-y-3">
                {recentQuotes.map((quote) => (
                  <Link key={quote.id} href={`/devis/${quote.id}`}>
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-1">
                          <div className="font-black text-white group-hover:text-blue-400 transition-colors text-lg">{quote.quote_number}</div>
                          <div className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors font-semibold mt-1">
                            {quote.client?.full_name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-white group-hover:text-blue-400 transition-colors text-xl mb-1.5">{formatCurrency(Number(quote.total))}</div>
                        <div className={`text-xs px-3 py-1.5 rounded-full inline-block font-bold ${
                          quote.status === 'draft' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          quote.status === 'sent' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          quote.status === 'accepted' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          quote.status === 'refused' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        } transition-colors`}>
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
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-lg font-bold text-white mb-2">Aucun devis</p>
                <p className="text-gray-300 mb-4 font-medium">Créez votre premier devis maintenant</p>
                <Link href="/devis/nouveau">
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 font-bold">
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

