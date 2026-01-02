'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Zap, TrendingUp, Clock, ShieldCheck, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { DevisRapideLogo } from '@/components/ui/logo';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Background: blanc pur */}

      {/* Header */}
      <motion.header 
        className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <DevisRapideLogo size="md" />
              </motion.div>
            </Link>
          </motion.div>

          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/connexion">
                <Button variant="ghost">Connexion</Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/inscription">
                <Button>Commencer</Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-10 md:pt-20">
        <motion.div 
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          <motion.div 
            className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-gray-300 bg-gray-100 px-4 py-2 text-base text-gray-900 shadow-sm font-medium"
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { type: "spring", stiffness: 100, damping: 15 }
              },
            }}
            whileHover={{ scale: 1.05 }}
          >
            <Smartphone className="h-5 w-5 text-primary" />
            Mobile-first • WhatsApp-ready • 3 minutes
          </motion.div>

          <motion.h1 
            className="text-balance text-4xl font-bold tracking-tight text-gray-950 md:text-6xl leading-tight"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { type: "spring", stiffness: 100, damping: 15 }
              },
            }}
          >
            Créez des devis et factures professionnels{' '}
            <motion.span 
              className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent inline-block"
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: '200% auto',
              }}
            >
              en moins de 3 minutes
            </motion.span>
          </motion.h1>

          <motion.p 
            className="mt-6 text-pretty text-lg text-gray-800 md:text-xl leading-relaxed font-medium"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { type: "spring", stiffness: 100, damping: 15 }
              },
            }}
          >
            L&apos;application pensée pour les artisans au Sénégal : créez, calculez et envoyez des devis et factures PDF
            via WhatsApp, SMS ou Email — sans prise de tête.
          </motion.p>

          <motion.div 
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { type: "spring", stiffness: 100, damping: 15 }
              },
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link href="/inscription" className="w-full sm:w-auto block">
                <Button size="lg" className="w-full sm:w-auto text-lg font-bold shadow-2xl">
                  Commencer gratuitement
                </Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link href="/connexion" className="w-full sm:w-auto block">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg font-bold border-2">
                  Se connecter
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-base text-gray-900"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.3,
                }
              },
            }}
          >
            {[
              { icon: ShieldCheck, text: 'Gratuit pour commencer' },
              { icon: Zap, text: 'Sans carte bancaire' },
              { icon: Clock, text: '5 devis/mois offerts' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.span 
                  key={index}
                  className="inline-flex items-center gap-2 font-semibold"
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { 
                      opacity: 1, 
                      x: 0,
                      transition: { type: "spring", stiffness: 200, damping: 20 }
                    },
                  }}
                  whileHover={{ scale: 1.1, x: 5 }}
                >
                  <Icon className="h-5 w-5 text-primary" /> {item.text}
                </motion.span>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <motion.div 
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {[
            {
              title: 'Rapide',
              desc: 'Créez un devis ou une facture complet en moins de 3 minutes depuis votre smartphone.',
              icon: Clock,
              gradient: 'from-blue-500 via-blue-400 to-blue-300',
              iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
              iconColor: 'text-white',
              borderColor: 'border-blue-300',
              glowColor: 'blue',
            },
            {
              title: 'Professionnel',
              desc: 'PDF propre, logo, totaux clairs : devis et factures qui inspirent confiance immédiatement.',
              icon: FileText,
              gradient: 'from-purple-500 via-purple-400 to-purple-300',
              iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
              iconColor: 'text-white',
              borderColor: 'border-purple-300',
              glowColor: 'purple',
            },
            {
              title: 'Simple',
              desc: 'Catalogue + clients + calculs automatiques. Zéro erreurs de calcul.',
              icon: Zap,
              gradient: 'from-amber-500 via-amber-400 to-amber-300',
              iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
              iconColor: 'text-white',
              borderColor: 'border-amber-300',
              glowColor: 'amber',
            },
            {
              title: 'Organisé',
              desc: 'Historique, statuts, renvoi, duplication : tout est sous contrôle.',
              icon: TrendingUp,
              gradient: 'from-emerald-500 via-emerald-400 to-emerald-300',
              iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
              iconColor: 'text-white',
              borderColor: 'border-emerald-300',
              glowColor: 'emerald',
            },
          ].map((f, index) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.9 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                    },
                  },
                }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-2xl border-2 bg-white p-6 shadow-lg cursor-pointer"
                style={{ 
                  borderColor: f.borderColor === 'border-blue-300' ? '#93c5fd' : 
                               f.borderColor === 'border-purple-300' ? '#c4b5fd' :
                               f.borderColor === 'border-amber-300' ? '#fcd34d' :
                               '#6ee7b7',
                  willChange: 'transform',
                }}
              >
                {/* Animated gradient background */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0`}
                  whileHover={{ opacity: 0.1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Shimmer effect */}
                <motion.div 
                  className="absolute -inset-10 -top-20 h-40 w-40 rotate-45 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-200%', opacity: 0 }}
                  whileHover={{ x: '200%', opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
                
                {/* Glow effect */}
                <motion.div 
                  className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${f.gradient} blur-xl`}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.4 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Icon with animation */}
                <motion.div 
                  className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${f.iconBg} ${f.iconColor} shadow-lg`}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: [0, -5, 5, -5, 0],
                    transition: { duration: 0.5 }
                  }}
                  style={{ willChange: 'transform' }}
                >
                  <Icon className="h-7 w-7" />
                </motion.div>
                
                <div className="relative z-10">
                  <motion.div 
                    className="text-xl font-bold tracking-tight text-gray-950 mb-2 transition-colors duration-200"
                    style={{
                      color: f.glowColor === 'blue' ? '#2563eb' :
                             f.glowColor === 'purple' ? '#9333ea' :
                             f.glowColor === 'amber' ? '#d97706' :
                             '#059669',
                    }}
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                  >
                    {f.title}
                  </motion.div>
                  <div className="text-base text-gray-700 leading-relaxed font-medium">
                    {f.desc}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <motion.div 
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <motion.h2 
            className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { type: "spring", stiffness: 100, damping: 15 }
              },
            }}
          >
            Tarifs simples
          </motion.h2>
          <motion.p 
            className="mt-4 text-lg text-gray-800 font-medium"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { type: "spring", stiffness: 100, damping: 15 }
              },
            }}
          >
            Commence gratuitement. Passe PRO quand tu as besoin d&apos;illimité.
          </motion.p>
        </motion.div>

        <motion.div 
          className="mt-10 flex justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            visible: {
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl w-full">
          {/* Plan Gratuit */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, x: -30 },
              visible: { 
                opacity: 1, 
                x: 0,
                transition: { type: "spring", stiffness: 100, damping: 15 }
              },
            }}
            whileHover={{ 
              y: -12, 
              scale: 1.02,
              transition: { type: "spring", stiffness: 400, damping: 17 }
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg cursor-pointer"
            style={{ willChange: 'transform' }}
          >
            <motion.div 
              className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full"
              initial={{ opacity: 0.3 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            {/* Animated shimmer */}
            <motion.div 
              className="absolute -inset-10 -top-20 h-40 w-40 rotate-45 bg-gradient-to-r from-transparent via-blue-100/40 to-transparent"
              initial={{ x: '-200%', opacity: 0 }}
              whileHover={{ x: '300%', opacity: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Plan</div>
                  <div className="text-2xl font-bold tracking-tight text-gray-900">Gratuit</div>
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-600">
                  Pour démarrer
                </span>
              </div>
              
              <div className="my-4">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-4xl font-bold text-gray-900">0</span>
                  <span className="text-2xl font-bold text-gray-400">.</span>
                  <span className="text-4xl font-bold text-gray-900">000</span>
                  <span className="text-lg font-semibold text-gray-600 ml-1.5">FCFA</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">/mois</div>
              </div>

              <ul className="space-y-2 text-sm mb-6">
                {[
                  '5 devis/mois',
                  '20 articles catalogue',
                  '10 clients max',
                  'Envoi WhatsApp/SMS/Email',
                  'Watermark sur PDF',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-gray-700 font-normal">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    </div>
                    <span className="text-sm">{t}</span>
                  </li>
                ))}
              </ul>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/inscription" className="block">
                  <Button variant="outline" className="w-full border-2">
                    Commencer gratuitement
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Plan PRO */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, x: 30 },
              visible: { 
                opacity: 1, 
                x: 0,
                transition: { type: "spring", stiffness: 100, damping: 15 }
              },
            }}
            whileHover={{ 
              y: -12, 
              scale: 1.02,
              transition: { type: "spring", stiffness: 400, damping: 17 }
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6 shadow-xl cursor-pointer"
            style={{ willChange: 'transform' }}
          >
            <motion.div 
              className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full"
              initial={{ opacity: 0.5 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            {/* Animated glow effect */}
            <motion.div 
              className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/30 via-primary/40 to-primary/30 blur-xl"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 0.7 }}
              transition={{ duration: 0.3 }}
            />
            {/* Animated shimmer */}
            <motion.div 
              className="absolute -inset-10 -top-20 h-40 w-40 rotate-45 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
              initial={{ x: '-200%', opacity: 0 }}
              whileHover={{ x: '300%', opacity: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute top-4 right-4 z-10"
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <span className="rounded-full bg-gradient-to-r from-primary to-primary/80 px-3 py-1 text-[10px] font-bold text-white shadow-md">
                ⭐ Populaire
              </span>
            </motion.div>
            
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider mb-0.5">Plan</div>
                  <div className="text-2xl font-bold tracking-tight text-gray-900">PRO</div>
                </div>
              </div>

              <div className="my-4">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-4xl font-bold text-gray-900">4</span>
                  <span className="text-2xl font-bold text-primary">.</span>
                  <span className="text-4xl font-bold text-gray-900">900</span>
                  <span className="text-lg font-semibold text-gray-600 ml-1.5">FCFA</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">/mois</div>
              </div>

              <ul className="space-y-2 text-sm mb-6">
                {[
                  'Devis illimités',
                  'Catalogue illimité',
                  'Clients illimités',
                  'Sans watermark',
                  'Templates multiples',
                  'Support WhatsApp prioritaire',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-gray-800 font-medium">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-sm">{t}</span>
                  </li>
                ))}
              </ul>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/inscription" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg">
                    Essai 14 jours gratuits
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-gray-600">
          <p>© 2026 DevisRapide. Fait avec soin pour les artisans sénégalais.</p>
        </div>
      </footer>
    </div>
  );
}
