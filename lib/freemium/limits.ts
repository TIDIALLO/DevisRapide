import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';
import { PLAN_LIMITS } from '@/types';

export interface LimitCheckResult {
  allowed: boolean;
  message?: string;
  current: number;
  limit: number | null;
}

/**
 * Vérifie si l'utilisateur peut créer un nouveau devis
 */
export async function canCreateQuote(userId: string, plan: 'free' | 'pro'): Promise<LimitCheckResult> {
  const limits = PLAN_LIMITS[plan];
  
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
 * Vérifie si l'utilisateur peut ajouter un nouveau client
 */
export async function canCreateClient(userId: string, plan: 'free' | 'pro'): Promise<LimitCheckResult> {
  const limits = PLAN_LIMITS[plan];
  
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
 * Vérifie si l'utilisateur peut ajouter un nouvel article au catalogue
 */
export async function canCreateCatalogItem(userId: string, plan: 'free' | 'pro'): Promise<LimitCheckResult> {
  const limits = PLAN_LIMITS[plan];
  
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
 * Récupère toutes les limites actuelles de l'utilisateur
 */
export async function getUserLimits(userId: string, plan: 'free' | 'pro') {
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
    limits: PLAN_LIMITS[plan],
  };
}

/**
 * Fonction pour créer un message de limite
 */
export function getLimitMessage(result: LimitCheckResult): string | null {
  if (result.allowed) return null;
  return result.message || 'Limite atteinte';
}

