import type { Database } from './database';
// Réexport de la config centralisée pour compatibilité
export { PLANS as PLAN_LIMITS_CONFIG } from '@/lib/subscription/config';
export type { Plan, PlanConfig } from '@/lib/subscription/config';

export type User = Database['public']['Tables']['users']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type CatalogItem = Database['public']['Tables']['catalog_items']['Row'];
export type Quote = Database['public']['Tables']['quotes']['Row'];
export type QuoteItem = Database['public']['Tables']['quote_items']['Row'];

export type Profession = 'peintre' | 'mecanicien' | 'quincaillier' | 'electricien' | 'plombier' | 'autre';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'refused' | 'expired';
export type DiscountType = 'percent' | 'fixed';

export interface QuoteWithDetails extends Quote {
  client: Client;
  items: QuoteItem[];
}

export interface DashboardStats {
  thisMonthQuotes: number;
  thisMonthTotal: number;
  acceptanceRate: number;
  topClients: Array<{
    name: string;
    total: number;
  }>;
  topServices: Array<{
    name: string;
    count: number;
  }>;
  monthlyData: Array<{
    month: string;
    total: number;
    count: number;
  }>;
}

// ─── Compatibilité ascendante ─────────────────────────────────────────────
// PLAN_LIMITS est conservé pour ne pas casser les imports existants.
// La source de vérité est maintenant lib/subscription/config.ts → PLANS.

export interface PlanLimits {
  maxQuotes: number | null;
  maxCatalogItems: number | null;
  maxClients: number | null;
  hasWatermark: boolean;
  canCustomizeTemplates: boolean;
}

export const PLAN_LIMITS: Record<'free' | 'pro', PlanLimits> = {
  free: {
    maxQuotes: 5,
    maxCatalogItems: 20,
    maxClients: 10,
    hasWatermark: true,
    canCustomizeTemplates: false,
  },
  pro: {
    maxQuotes: null,
    maxCatalogItems: null,
    maxClients: null,
    hasWatermark: false,
    canCustomizeTemplates: true,
  },
};

