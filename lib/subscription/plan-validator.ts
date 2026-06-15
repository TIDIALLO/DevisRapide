/**
 * Validation et gestion de l'état du plan utilisateur
 * 
 * Ce module vérifie si un plan est actif, en essai, expiré, etc.
 * Il est utilisé côté client ET serveur.
 */

import { PLANS, TRIAL_DURATION_DAYS, GRACE_PERIOD_DAYS } from './config';
import type { Plan, SubscriptionStatus, PlanConfig } from './config';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserPlanInfo {
  /** Plan stocké en DB ('free' | 'pro') */
  plan: Plan;
  /** Date d'expiration du plan (null si free sans essai) */
  planExpiresAt: string | null;
  /** Date de création du compte */
  createdAt: string;
}

export interface PlanStatus {
  /** Le plan effectif (après vérification expiration) */
  effectivePlan: Plan;
  /** Statut de l'abonnement */
  status: SubscriptionStatus;
  /** La config du plan effectif (limites, features) */
  config: PlanConfig;
  /** Jours restants avant expiration (-1 si illimité/free) */
  daysRemaining: number;
  /** Est-ce que l'utilisateur est en essai gratuit ? */
  isTrial: boolean;
  /** Est-ce que le plan est actif (non expiré) ? */
  isActive: boolean;
  /** Est-ce que l'utilisateur peut encore utiliser les features PRO ? (inclut grâce) */
  hasProAccess: boolean;
  /** Message à afficher à l'utilisateur (null si RAS) */
  warningMessage: string | null;
}

// ─── Fonctions principales ──────────────────────────────────────────────────

/**
 * Calcule le statut complet du plan d'un utilisateur.
 * 
 * Logique :
 * 1. Plan 'free' sans plan_expires_at → Vérifie si en période d'essai
 * 2. Plan 'pro' avec plan_expires_at → Vérifie si expiré
 * 3. Plan 'pro' sans plan_expires_at → Considéré actif (abonnement Stripe géré par webhook)
 */
export function getPlanStatus(userInfo: UserPlanInfo): PlanStatus {
  const now = new Date();
  const { plan, planExpiresAt, createdAt } = userInfo;

  // ── Cas 1 : Plan FREE ─────────────────────────────────────────────────
  if (plan === 'free') {
    const trialStatus = getTrialStatus(createdAt);

    if (trialStatus.isInTrial) {
      // En période d'essai : accès PRO temporaire
      return {
        effectivePlan: 'pro',
        status: 'trialing',
        config: PLANS.pro,
        daysRemaining: trialStatus.daysRemaining,
        isTrial: true,
        isActive: true,
        hasProAccess: true,
        warningMessage: trialStatus.daysRemaining <= 3
          ? `Votre essai gratuit expire dans ${trialStatus.daysRemaining} jour${trialStatus.daysRemaining > 1 ? 's' : ''}. Passez PRO pour continuer.`
          : null,
      };
    }

    // Essai terminé, plan gratuit classique
    return {
      effectivePlan: 'free',
      status: 'active',
      config: PLANS.free,
      daysRemaining: -1,
      isTrial: false,
      isActive: true,
      hasProAccess: false,
      warningMessage: null,
    };
  }

  // ── Cas 2 : Plan PRO avec date d'expiration ───────────────────────────
  if (planExpiresAt) {
    const expiresAt = new Date(planExpiresAt);
    const diffMs = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Plan expiré ?
    if (daysRemaining < 0) {
      const daysPastExpiry = Math.abs(daysRemaining);

      // Période de grâce (3 jours après expiration)
      if (daysPastExpiry <= GRACE_PERIOD_DAYS) {
        return {
          effectivePlan: 'pro',
          status: 'past_due',
          config: PLANS.pro,
          daysRemaining: 0,
          isTrial: false,
          isActive: false,
          hasProAccess: true, // Encore accès pendant la grâce
          warningMessage: `Votre abonnement PRO a expiré. Renouvelez dans les ${GRACE_PERIOD_DAYS - daysPastExpiry} jour(s) restants pour ne pas perdre l'accès.`,
        };
      }

      // Complètement expiré → retour au FREE
      return {
        effectivePlan: 'free',
        status: 'expired',
        config: PLANS.free,
        daysRemaining: 0,
        isTrial: false,
        isActive: false,
        hasProAccess: false,
        warningMessage: 'Votre abonnement PRO a expiré. Renouvelez pour retrouver l\'accès illimité.',
      };
    }

    // Plan actif, bientôt expiré ?
    const warning = daysRemaining <= 5
      ? `Votre abonnement PRO expire dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}.`
      : null;

    return {
      effectivePlan: 'pro',
      status: 'active',
      config: PLANS.pro,
      daysRemaining,
      isTrial: false,
      isActive: true,
      hasProAccess: true,
      warningMessage: warning,
    };
  }

  // ── Cas 3 : Plan PRO sans date d'expiration (géré par Stripe webhook) ─
  return {
    effectivePlan: 'pro',
    status: 'active',
    config: PLANS.pro,
    daysRemaining: -1,
    isTrial: false,
    isActive: true,
    hasProAccess: true,
    warningMessage: null,
  };
}

// ─── Essai gratuit ──────────────────────────────────────────────────────────

interface TrialStatus {
  isInTrial: boolean;
  daysRemaining: number;
  daysUsed: number;
  totalDays: number;
}

/**
 * Vérifie si un utilisateur est en période d'essai gratuit.
 * L'essai commence à la création du compte et dure TRIAL_DURATION_DAYS jours.
 */
export function getTrialStatus(createdAt: string): TrialStatus {
  const now = new Date();
  const accountCreated = new Date(createdAt);
  const trialEnd = new Date(accountCreated);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);

  const diffMs = trialEnd.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const daysUsed = TRIAL_DURATION_DAYS - daysRemaining;

  return {
    isInTrial: diffMs > 0,
    daysRemaining,
    daysUsed,
    totalDays: TRIAL_DURATION_DAYS,
  };
}

/**
 * Raccourci : est-ce que l'utilisateur a accès aux features PRO ?
 * Prend en compte : plan actif, essai, période de grâce.
 */
export function hasProAccess(userInfo: UserPlanInfo): boolean {
  return getPlanStatus(userInfo).hasProAccess;
}

/**
 * Retourne le plan effectif (après vérification expiration + essai).
 */
export function getEffectivePlan(userInfo: UserPlanInfo): Plan {
  return getPlanStatus(userInfo).effectivePlan;
}
