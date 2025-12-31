'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone, Wallet, Shield, Lock, CheckCircle, User, Phone, DollarSign } from 'lucide-react';
// import type { PaymentType } from '@/lib/bictorys/types';
// import { OrangeMoneyLogo, WaveLogo } from './payment-logos';
import { motion, AnimatePresence } from 'framer-motion';

// Types pour Stripe (remplace Bictorys)
type PaymentType = 'stripe' | 'card';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  quoteNumber: string;
  quoteId: string;
  onPaymentInitiated: (checkoutUrl: string) => void;
}

// Méthodes de paiement Stripe (Bictorys commenté)
const PAYMENT_METHODS: {
  type: PaymentType;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}[] = [
  {
    type: 'stripe',
    label: 'Payer avec Stripe',
    description: 'Carte bancaire sécurisée (Visa, Mastercard, etc.)',
    icon: <CreditCard className="h-6 w-6" />,
    gradient: 'from-blue-500 to-blue-600',
  },
];

/* BICTORYS - COMMENTÉ
const PAYMENT_METHODS: {
  type: PaymentType | 'checkout';
  label: string;
  description: string;
  icon: React.ReactNode;
  customIcon?: React.ReactNode;
  gradient: string;
}[] = [
  {
    type: 'checkout',
    label: 'Choisir le mode de paiement',
    description: 'Vous serez redirigé vers une page sécurisée pour choisir votre mode de paiement',
    icon: <Wallet className="h-6 w-6" />,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    type: 'orange_money',
    label: 'Orange Money',
    description: 'Payer avec votre compte Orange Money',
    icon: <Smartphone className="h-6 w-6" />,
    customIcon: <OrangeMoneyLogo className="w-8 h-8" />,
    gradient: 'from-orange-500 to-orange-600',
  },
  {
    type: 'wave',
    label: 'Wave',
    description: 'Payer avec votre compte Wave',
    icon: <Smartphone className="h-6 w-6" />,
    customIcon: <WaveLogo className="w-8 h-8" />,
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    type: 'card',
    label: 'Carte bancaire',
    description: 'Visa, Mastercard ou autres cartes',
    icon: <CreditCard className="h-6 w-6" />,
    gradient: 'from-green-500 to-green-600',
  },
];
*/

export function PaymentModal({
  open,
  onOpenChange,
  amount: initialAmount,
  quoteNumber,
  quoteId,
  onPaymentInitiated,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [phone, setPhone] = useState(''); // Bictorys - commenté
  const [amount, setAmount] = useState(initialAmount.toString());
  const [selectedMethod, setSelectedMethod] = useState<PaymentType | null>(null);

  const handlePayment = async (paymentType: PaymentType) => {
    setLoading(true);
    setError(null);

    try {
      // Validation
      const amountNum = parseFloat(amount.replace(/\s/g, '').replace(/\./g, ''));
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Veuillez saisir un montant valide');
      }

      // Déterminer si c'est un upgrade PRO ou un paiement de facture
      const isUpgrade = quoteId === 'upgrade-pro';

      if (!isUpgrade && !quoteId) {
        throw new Error('ID de facture introuvable');
      }

      // Appel API Stripe
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId: isUpgrade ? null : quoteId,
          amount: amountNum,
          isUpgrade,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `Erreur ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Rediriger vers Stripe Checkout
      if (data.url) {
        onPaymentInitiated(data.url);
        window.location.href = data.url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (err: any) {
      console.error('Erreur paiement:', err);
      const errorMessage = err.message || 'Une erreur est survenue lors de la création du paiement. Veuillez réessayer.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  /* BICTORYS - COMMENTÉ
  const handlePayment = async (paymentType: PaymentType | 'checkout') => {
    setLoading(true);
    setError(null);

    try {
      // Validation
      const amountNum = parseFloat(amount.replace(/\s/g, '').replace(/\./g, ''));
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Veuillez saisir un montant valide');
      }

      // Pour Orange Money et Wave, le téléphone est requis
      if ((paymentType === 'orange_money' || paymentType === 'wave') && !phone.trim()) {
        throw new Error('Veuillez saisir votre numéro de téléphone');
      }

      // Déterminer si c'est un upgrade PRO ou un paiement de facture
      const isUpgrade = quoteId === 'upgrade-pro';
      const apiEndpoint = isUpgrade 
        ? '/api/bictorys/create-upgrade-charge'
        : '/api/bictorys/create-charge';

      const requestBody = isUpgrade
        ? {
            paymentType: paymentType === 'checkout' ? undefined : paymentType,
            amount: amountNum,
            phone: (paymentType === 'orange_money' || paymentType === 'wave') ? phone.trim() : undefined,
          }
        : {
            quoteId,
            paymentType: paymentType === 'checkout' ? undefined : paymentType,
            amount: amountNum,
            phone: (paymentType === 'orange_money' || paymentType === 'wave') ? phone.trim() : undefined,
          };

      if (!isUpgrade && !quoteId) {
        throw new Error('ID de facture introuvable');
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Lire la réponse (peut être JSON ou HTML)
      const responseText = await response.text();
      let data: any;

      // Essayer de parser comme JSON
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // Si ce n'est pas du JSON (probablement HTML), extraire le message d'erreur
        console.error('Réponse non-JSON de Bictorys:', responseText.substring(0, 500));
        
        // Si c'est une erreur 403, c'est généralement un problème d'authentification
        if (response.status === 403) {
          throw new Error('Erreur 403: Clé API invalide ou non autorisée. Veuillez contacter le support technique.');
        }
        
        // Pour les autres erreurs, essayer d'extraire un message
        const htmlMatch = responseText.match(/<h1[^>]*>(.*?)<\/h1>/i);
        const errorMsg = htmlMatch ? htmlMatch[1] : `Erreur serveur (${response.status})`;
        throw new Error(errorMsg);
      }

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || data?.details || `Erreur ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Rediriger vers la page de paiement Bictorys
      if (data.checkoutUrl) {
        onPaymentInitiated(data.checkoutUrl);
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (err: any) {
      console.error('Erreur paiement:', err);
      const errorMessage = err.message || 'Une erreur est survenue lors de la création du paiement. Veuillez réessayer.';
      setError(errorMessage);
      setLoading(false);
    }
  };
  */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Barre de progression animée */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />

        <DialogHeader className="space-y-4 pb-4">
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Shield className="w-10 h-10 text-primary" />
            </motion.div>
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold text-gray-900 leading-tight">
                Paiement 100% sécurisé
              </DialogTitle>
              <DialogDescription className="text-lg text-gray-700 font-medium mt-2 leading-relaxed">
                {quoteId === 'upgrade-pro'
                  ? 'Passez au Plan PRO et débloquez toutes les fonctionnalités'
                  : `Facture ${quoteNumber}`
                }
              </DialogDescription>
            </div>
          </motion.div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="bg-red-50 border-2 border-red-300 text-red-800 p-5 rounded-xl shadow-lg"
              >
                <p className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="text-2xl">❌</span> Erreur
                </p>
                <p className="text-base font-medium leading-relaxed">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulaire de saisie */}
          <motion.div 
            className="space-y-4 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              {/* Montant */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Label htmlFor="amount" className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Montant à payer (FCFA)
                </Label>
                <Input
                  id="amount"
                  type="text"
                  value={amount ? new Intl.NumberFormat('fr-FR').format(parseFloat(amount) || 0).replace(/\s/g, '.') : ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setAmount(value);
                  }}
                  placeholder="Ex: 5000"
                  className="text-2xl font-bold h-16 border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4"
                />
                <motion.p 
                  className="text-sm text-gray-600 mt-3 font-medium"
                  key={amount}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  Montant: <span className="font-bold text-primary text-base">{new Intl.NumberFormat('fr-FR').format(parseFloat(amount) || 0)} FCFA</span>
                </motion.p>
              </motion.div>

              {/* BICTORYS - Téléphone (commenté) */}
              {/* <AnimatePresence>
                {(selectedMethod === 'orange_money' || selectedMethod === 'wave') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="phone" className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      Numéro de téléphone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 771234567"
                      className="text-lg font-semibold h-14 border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: 771234567 (sans espaces ni caractères spéciaux)
                    </p>
                  </motion.div>
                )}
              </AnimatePresence> */}
            </div>
          </motion.div>

          {/* Montant affiché - Design ultra-moderne */}
          <motion.div 
            className="relative overflow-hidden text-center py-8 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-white/90" />
                <p className="text-sm font-semibold text-white/90 uppercase tracking-wider">Montant à payer</p>
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <motion.p 
                  className="text-6xl font-black text-white leading-none drop-shadow-lg"
                  key={amount}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {new Intl.NumberFormat('fr-FR', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                    .format(parseFloat(amount) || 0)
                    .replace(/\s/g, '.')}
                </motion.p>
                <span className="text-3xl font-bold text-white/95 mb-2">FCFA</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 text-white/80">
                <CheckCircle className="w-4 h-4" />
                <p className="text-sm font-medium">Paiement unique • Sans frais cachés</p>
              </div>
            </div>
          </motion.div>

          {/* Méthodes de paiement - Design amélioré */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Sélectionnez votre mode de paiement
            </h3>
            <div className="grid gap-3">
              {PAYMENT_METHODS.map((method, index) => (
                <motion.button
                  key={method.type}
                  onClick={() => {
                    setSelectedMethod(method.type as PaymentType);
                    // Payer directement avec Stripe
                    handlePayment(method.type as PaymentType);
                  }}
                  disabled={loading}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.1, duration: 0.3 }
                    },
                  }}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ 
                    y: -4, 
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    group relative flex items-center gap-5 p-5 rounded-2xl border-2
                    ${selectedMethod === method.type ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200'}
                    transition-all duration-300 ease-out
                    hover:border-primary hover:shadow-2xl hover:shadow-primary/20
                    hover:bg-gradient-to-br hover:from-white hover:to-primary/5
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${loading ? 'cursor-wait' : 'cursor-pointer'}
                    bg-white backdrop-blur-sm
                  `}
                  style={{ willChange: 'transform' }}
                >
                  {/* Effet de brillance au survol */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>

                  {/* Logo ou icône avec animation Motion */}
                  <motion.div 
                    className={`
                      relative shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${method.gradient}
                      text-white flex items-center justify-center shadow-lg
                    `}
                    whileHover={{ 
                      scale: 1.15, 
                      rotate: [0, -5, 5, -5, 0],
                      transition: { duration: 0.5 }
                    }}
                    style={{ willChange: 'transform' }}
                  >
                    {method.customIcon || method.icon}
                    <motion.div 
                      className="absolute inset-0 rounded-xl bg-white/20"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>

                  {/* Texte - Ultra professionnel */}
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900 text-xl leading-tight group-hover:text-primary transition-colors">
                      {method.label}
                    </p>
                    <p className="text-sm text-gray-600 mt-1.5 font-medium leading-relaxed">
                      {method.description}
                    </p>
                  </div>

                  {/* Indicateur de chargement */}
                  {loading && (
                    <motion.div 
                      className="shrink-0"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div 
                        className="rounded-full h-6 w-6 border-2 border-primary border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                  )}

                  {/* Bouton Payer ou Flèche */}
                  {!loading && (
                    <div className="flex-shrink-0 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                  {/* BICTORYS - Commenté
                  {selectedMethod === method.type && (method.type === 'orange_money' || method.type === 'wave') ? (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayment(method.type as PaymentType | 'checkout');
                        }}
                        disabled={loading || !phone.trim() || !amount}
                        className="bg-primary hover:bg-primary/90 text-white font-semibold"
                      >
                        {loading ? 'Traitement...' : 'Payer maintenant'}
                      </Button>
                    </motion.div>
                  ) : !loading && (
                    <div className="flex-shrink-0 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                  */}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Sécurité et garanties - Design amélioré */}
          <motion.div 
            className="space-y-3 pt-6 border-t-2 border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-2">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Shield className="w-6 h-6 text-green-600" />
              </motion.div>
              <p className="text-base text-gray-800 font-semibold">
                Paiement sécurisé et crypté par <span className="font-bold text-primary">Stripe</span>
              </p>
            </div>
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              {[
                { icon: CheckCircle, text: 'Protection des données' },
                { icon: CheckCircle, text: 'Paiement instantané' },
                { icon: CheckCircle, text: 'Support 24/7' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div 
                    key={index}
                    className="flex items-center gap-2"
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon className="w-5 h-5 text-green-600" />
                    <span className="font-medium">{item.text}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
