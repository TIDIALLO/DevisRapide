/**
 * Module de gestion des abonnements DevisRapide
 * 
 * Point d'entrée unique pour toute la logique d'abonnement.
 * Import : import { PLANS, getPlanStatus, ... } from '@/lib/subscription';
 */

export {
  // Config et constantes
  PLANS,
  PRO_PRICE_MONTHLY,
  PRO_PRICE_YEARLY,
  CURRENCY,
  CURRENCY_LABEL,
  TRIAL_DURATION_DAYS,
  GRACE_PERIOD_DAYS,
  PRO_FEATURES,
  FREE_FEATURES,
  formatPriceFCFA,
  getProPriceLabel,
} from './config';

export type {
  Plan,
  PlanConfig,
  SubscriptionStatus,
} from './config';

export {
  // Validation du plan
  getPlanStatus,
  getTrialStatus,
  hasProAccess,
  getEffectivePlan,
} from './plan-validator';

export type {
  UserPlanInfo,
  PlanStatus,
} from './plan-validator';
