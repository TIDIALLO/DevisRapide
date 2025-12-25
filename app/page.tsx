import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Zap, TrendingUp, Clock, ShieldCheck, Smartphone } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Background: blanc pur */}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <FileText className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-gray-900">DevisRapide</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/connexion">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/inscription">
              <Button>Commencer</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-10 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700 shadow-sm">
            <Smartphone className="h-4 w-4 text-primary" />
            Mobile-first • WhatsApp-ready • 3 minutes
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Créez des devis professionnels{' '}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              en moins de 3 minutes
            </span>
          </h1>

          <p className="mt-5 text-pretty text-base text-gray-600 md:text-lg">
            L&apos;application pensée pour les artisans au Sénégal : créez, calculez et envoyez des devis PDF
            via WhatsApp, SMS ou Email — sans prise de tête.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/inscription" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="/connexion" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Se connecter
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-700">
            <span className="inline-flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-primary" /> Gratuit pour commencer
            </span>
            <span className="inline-flex items-center gap-2 font-medium">
              <Zap className="h-4 w-4 text-primary" /> Sans carte bancaire
            </span>
            <span className="inline-flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4 text-primary" /> 5 devis/mois offerts
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Rapide',
              desc: 'Créez un devis complet en moins de 3 minutes depuis votre smartphone.',
              icon: Clock,
              gradient: 'from-blue-500/10 via-blue-400/5 to-transparent',
              iconBg: 'bg-blue-500/10',
              iconColor: 'text-blue-600',
              borderColor: 'border-blue-200/50',
            },
            {
              title: 'Professionnel',
              desc: 'PDF propre, logo, totaux clairs : inspirez confiance immédiatement.',
              icon: FileText,
              gradient: 'from-purple-500/10 via-purple-400/5 to-transparent',
              iconBg: 'bg-purple-500/10',
              iconColor: 'text-purple-600',
              borderColor: 'border-purple-200/50',
            },
            {
              title: 'Simple',
              desc: 'Catalogue + clients + calculs automatiques. Zéro erreurs de calcul.',
              icon: Zap,
              gradient: 'from-amber-500/10 via-amber-400/5 to-transparent',
              iconBg: 'bg-amber-500/10',
              iconColor: 'text-amber-600',
              borderColor: 'border-amber-200/50',
            },
            {
              title: 'Organisé',
              desc: 'Historique, statuts, renvoi, duplication : tout est sous contrôle.',
              icon: TrendingUp,
              gradient: 'from-emerald-500/10 via-emerald-400/5 to-transparent',
              iconBg: 'bg-emerald-500/10',
              iconColor: 'text-emerald-600',
              borderColor: 'border-emerald-200/50',
            },
          ].map((f, index) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border-2 bg-white p-6 shadow-sm transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02]"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                  borderColor: `hsl(var(--border))`,
                }}
              >
                {/* Animated gradient background on hover */}
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                
                {/* Shimmer effect */}
                <div className="pointer-events-none absolute -inset-10 -top-20 h-40 w-40 rotate-45 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:translate-x-[200%]" />
                
                {/* Glow effect */}
                <div className={`pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r ${f.gradient} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-50`} />

                {/* Icon with animation */}
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.iconBg} ${f.iconColor} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                </div>
                
                <div className="relative z-10 font-semibold tracking-tight text-gray-900 transition-colors duration-300 group-hover:text-gray-950">
                  {f.title}
                </div>
                <div className="relative z-10 mt-2 text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                  {f.desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Tarifs simples
          </h2>
          <p className="mt-3 text-gray-600">
            Commence gratuitement. Passe PRO quand tu as besoin d&apos;illimité.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Plan Gratuit */}
          <div className="group relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-white p-8 shadow-lg transition-all duration-500 ease-out hover:-translate-y-3 hover:shadow-2xl hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
            {/* Animated shimmer */}
            <div className="pointer-events-none absolute -inset-10 -top-20 h-40 w-40 rotate-45 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent opacity-0 transition-all duration-1000 group-hover:opacity-100 group-hover:translate-x-[300%]" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Plan</div>
                  <div className="text-3xl font-bold tracking-tight text-gray-900">Gratuit</div>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  Pour démarrer
                </span>
              </div>
              
              <div className="my-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-gray-900">0</span>
                  <span className="text-3xl font-bold text-gray-400">.</span>
                  <span className="text-5xl font-bold text-gray-900">000</span>
                  <span className="text-xl font-semibold text-gray-600 ml-2">FCFA</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">/mois</div>
              </div>

              <ul className="space-y-3 text-sm mb-8">
                {[
                  '5 devis/mois',
                  '20 articles catalogue',
                  '10 clients max',
                  'Envoi WhatsApp/SMS/Email',
                  'Watermark sur PDF',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-gray-700">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    </div>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/inscription" className="block">
                <Button variant="outline" className="w-full border-2 transition-all duration-300 hover:bg-gray-50 hover:scale-105 hover:shadow-md">
                  Commencer gratuitement
                </Button>
              </Link>
            </div>
          </div>

          {/* Plan PRO */}
          <div className="group relative overflow-hidden rounded-3xl border-2 border-primary bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 shadow-xl transition-all duration-500 ease-out hover:-translate-y-3 hover:shadow-2xl hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full transition-opacity duration-500 group-hover:opacity-100" />
            {/* Animated glow effect */}
            <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60" />
            {/* Animated shimmer */}
            <div className="pointer-events-none absolute -inset-10 -top-20 h-40 w-40 rotate-45 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-all duration-1000 group-hover:opacity-100 group-hover:translate-x-[300%]" />
            <div className="absolute top-4 right-4 z-10">
              <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                ⭐ Populaire
              </span>
            </div>
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1">Plan</div>
                  <div className="text-3xl font-bold tracking-tight text-gray-900">PRO</div>
                </div>
              </div>

              <div className="my-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-gray-900">5</span>
                  <span className="text-3xl font-bold text-primary">.</span>
                  <span className="text-5xl font-bold text-gray-900">000</span>
                  <span className="text-xl font-semibold text-gray-600 ml-2">FCFA</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">/mois</div>
              </div>

              <ul className="space-y-3 text-sm mb-8">
                {[
                  'Devis illimités',
                  'Catalogue illimité',
                  'Clients illimités',
                  'Sans watermark',
                  'Templates multiples',
                  'Support WhatsApp prioritaire',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-gray-800 font-medium">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <Link href="/inscription" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Essai 14 jours gratuits
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-gray-600">
          <p>© 2024 DevisRapide. Fait avec soin pour les artisans sénégalais.</p>
        </div>
      </footer>
    </div>
  );
}
