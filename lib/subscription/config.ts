/**
 * Configuration centralisée des abonnements DevisRapide
 * 
 * Tous les prix sont en FCFA (Franc CFA - XOF).
 * Ce fichier est la SEULE source de vérité pour les prix et limites.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type Plan = 'free' | 'pro';

export type SubscriptionStatus =
  | 'active'       // Abonnement actif et payé
  | 'trialing'     // En période d'essai gratuit
  | 'past_due'     // Paiement en retard (grâce de 3 jours)
  | 'canceled'     // Annulé par l'utilisateur
  | 'expired';     // Expiré (plan_expires_at dépassé)

export interface PlanConfig {
  /** Identifiant du plan */
  id: Plan;
  /** Nom affiché à l'utilisateur */
  name: string;
  /** Prix mensuel en FCFA (0 pour gratuit) */
  priceMonthly: number;
  /** Prix annuel en FCFA (null si pas dispo) */
  priceYearly: number | null;
  /** Devise */
  currency: 'XOF';
  /** Nombre max de devis par mois (null = illimité) */
  maxQuotes: number | null;
  /** Nombre max d'articles dans le catalogue (null = illimité) */
  maxCatalogItems: number | null;
  /** Nombre max de clients (null = illimité) */
  maxClients: number | null;
  /** Filigrane "DevisRapide" sur les PDF ? */
  hasWatermark: boolean;
  /** Personnalisation des templates PDF */
  canCustomizeTemplates: boolean;
  /** Support prioritaire WhatsApp */
  hasPrioritySupport: boolean;
  /** Export multi-format (Excel, Word) */
  hasMultiExport: boolean;
  /** Description courte du plan */
  description: string;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

/** Durée de l'essai gratuit en jours */
export const TRIAL_DURATION_DAYS = 14;

/** Nombre de jours de grâce après expiration avant downgrade */
export const GRACE_PERIOD_DAYS = 3;

/** Devise utilisée */
export const CURRENCY = 'XOF' as const;

/** Symbole de la devise affiché */
export const CURRENCY_LABEL = 'FCFA';

// ─── Plans ───────────────────────────────────────────────────────────────────

export const PLANS: Record<Plan, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Gratuit',
    priceMonthly: 0,
    priceYearly: null,
    currency: 'XOF',
    maxQuotes: 5,
    maxCatalogItems: 20,
    maxClients: 10,
    hasWatermark: true,
    canCustomizeTemplates: false,
    hasPrioritySupport: false,
    hasMultiExport: false,
    description: '5 devis/mois • 20 articles • 10 clients',
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    priceMonthly: 4_900,  // 4.900 FCFA/mois
    priceYearly: 49_000,  // 49.000 FCFA/an (~2 mois offerts)
    currency: 'XOF',
    maxQuotes: null,
    maxCatalogItems: null,
    maxClients: null,
    hasWatermark: false,
    canCustomizeTemplates: true,
    hasPrioritySupport: true,
    hasMultiExport: true,
    description: 'Illimité • Sans watermark • Support prioritaire',
  },
};

/** Prix PRO mensuel en FCFA — raccourci pratique */
export const PRO_PRICE_MONTHLY = PLANS.pro.priceMonthly; // 4900

/** Prix PRO annuel en FCFA */
export const PRO_PRICE_YEARLY = PLANS.pro.priceYearly!;  // 49000

// ─── Features pour l'affichage ──────────────────────────────────────────────

export const PRO_FEATURES = [
  'Devis illimités',
  'Catalogue illimité',
  'Clients illimités',
  'Sans watermark',
  'Templates multiples',
  'Export multi-format',
  'Support WhatsApp prioritaire',
] as const;

export const FREE_FEATURES = [
  '5 devis/mois',
  '20 articles catalogue',
  '10 clients max',
  'Envoi WhatsApp/SMS/Email',
  'Watermark sur PDF',
] as const;

// ─── Helpers de formatage ───────────────────────────────────────────────────

/**
 * Formate un prix en FCFA avec séparateur de milliers
 * @example formatPriceFCFA(4900) → "4.900 FCFA"
 * @example formatPriceFCFA(0) → "0 FCFA"
 */
export function formatPriceFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\s/g, '.') + ` ${CURRENCY_LABEL}`;
}

/**
 * Retourne le texte prix "4.900 FCFA/mois" pour le plan PRO
 */
export function getProPriceLabel(): string {
  return `${formatPriceFCFA(PRO_PRICE_MONTHLY)}/mois`;
}
