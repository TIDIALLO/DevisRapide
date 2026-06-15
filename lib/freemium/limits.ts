import { createClient } from '@/lib/supabase/client';
import { PLANS } from '@/lib/subscription/config';
import { getPlanStatus, getEffectivePlan } from '@/lib/subscription/plan-validator';
import type { Plan } from '@/lib/subscription/config';
import type { UserPlanInfo } from '@/lib/subscription/plan-validator';

export interface LimitCheckResult {
  allowed: boolean;
  message?: string;
  current: number;
  limit: number | null;
}

/**
 * Construit les infos plan d'un utilisateur à partir du profil DB.
 * Utilise getEffectivePlan() pour tenir compte de l'expiration et de l'essai.
 */
function buildUserPlanInfo(profile: {
  plan: string;
  plan_expires_at: string | null;
  created_at: string;
}): { effectivePlan: Plan; userInfo: UserPlanInfo } {
  const userInfo: UserPlanInfo = {
    plan: profile.plan as Plan,
    planExpiresAt: profile.plan_expires_at,
    createdAt: profile.created_at,
  };
  return { effectivePlan: getEffectivePlan(userInfo), userInfo };
}

/**
 * Récupère le plan effectif d'un utilisateur (tient compte de l'expiration et de l'essai).
 */
export async function getUserEffectivePlan(userId: string): Promise<{
  plan: Plan;
  status: ReturnType<typeof getPlanStatus>;
}> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('users')
    .select('plan, plan_expires_at, created_at')
    .eq('id', userId)
    .single();

  if (!profile) {
    return {
      plan: 'free',
      status: getPlanStatus({ plan: 'free', planExpiresAt: null, createdAt: new Date().toISOString() }),
    };
  }

  const userInfo: UserPlanInfo = {
    plan: profile.plan as Plan,
    planExpiresAt: profile.plan_expires_at,
    createdAt: profile.created_at,
  };

  return {
    plan: getEffectivePlan(userInfo),
    status: getPlanStatus(userInfo),
  };
}

/**
 * Vérifie si l'utilisateur peut créer un nouveau devis.
 * Utilise le plan effectif (après vérification expiration + essai).
 */
export async function canCreateQuote(userId: string, planOverride?: Plan): Promise<LimitCheckResult> {
  const plan = planOverride ?? (await getUserEffectivePlan(userId)).plan;
  const limits = PLANS[plan];

  if (limits.maxQuotes === null) {
    return { allowed: true, current: 0, limit: null };
  }

  const supabase = createClient();

  // Compter les devis du mois en cours
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());

  const current = count || 0;
  const allowed = current < limits.maxQuotes;

  return {
    allowed,
    current,
    limit: limits.maxQuotes,
    message: allowed
      ? undefined
      : `Limite atteinte : ${current}/${limits.maxQuotes} devis ce mois. Passez PRO pour des devis illimités.`,
  };
}

/**
 * Vérifie si l'utilisateur peut ajouter un nouveau client.
 */
export async function canCreateClient(userId: string, planOverride?: Plan): Promise<LimitCheckResult> {
  const plan = planOverride ?? (await getUserEffectivePlan(userId)).plan;
  const limits = PLANS[plan];

  if (limits.maxClients === null) {
    return { allowed: true, current: 0, limit: null };
  }

  const supabase = createClient();

  const { count } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const current = count || 0;
  const allowed = current < limits.maxClients;

  return {
    allowed,
    current,
    limit: limits.maxClients,
    message: allowed
      ? undefined
      : `Limite atteinte : ${current}/${limits.maxClients} clients. Passez PRO pour des clients illimités.`,
  };
}

/**
 * Vérifie si l'utilisateur peut ajouter un nouvel article au catalogue.
 */
export async function canCreateCatalogItem(userId: string, planOverride?: Plan): Promise<LimitCheckResult> {
  const plan = planOverride ?? (await getUserEffectivePlan(userId)).plan;
  const limits = PLANS[plan];

  if (limits.maxCatalogItems === null) {
    return { allowed: true, current: 0, limit: null };
  }

  const supabase = createClient();

  const { count } = await supabase
    .from('catalog_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const current = count || 0;
  const allowed = current < limits.maxCatalogItems;

  return {
    allowed,
    current,
    limit: limits.maxCatalogItems,
    message: allowed
      ? undefined
      : `Limite atteinte : ${current}/${limits.maxCatalogItems} articles. Passez PRO pour un catalogue illimité.`,
  };
}

/**
 * Récupère toutes les limites actuelles de l'utilisateur.
 */
export async function getUserLimits(userId: string) {
  const { plan, status } = await getUserEffectivePlan(userId);

  const [quotes, clients, catalogItems] = await Promise.all([
    canCreateQuote(userId, plan),
    canCreateClient(userId, plan),
    canCreateCatalogItem(userId, plan),
  ]);

  return {
    quotes,
    clients,
    catalogItems,
    plan,
    planStatus: status,
    limits: PLANS[plan],
  };
}

/**
 * Retourne un message de limite lisible.
 */
export function getLimitMessage(result: LimitCheckResult): string | null {
  if (result.allowed) return null;
  return result.message || 'Limite atteinte';
}
