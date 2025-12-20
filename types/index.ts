import type { Database } from './database';

export type User = Database['public']['Tables']['users']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type CatalogItem = Database['public']['Tables']['catalog_items']['Row'];
export type Quote = Database['public']['Tables']['quotes']['Row'];
export type QuoteItem = Database['public']['Tables']['quote_items']['Row'];

export type Profession = 'peintre' | 'mecanicien' | 'quincaillier' | 'electricien' | 'plombier' | 'autre';
export type Plan = 'free' | 'pro';
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

export interface PlanLimits {
  maxQuotes: number | null; // null = unlimited
  maxCatalogItems: number | null;
  maxClients: number | null;
  hasWatermark: boolean;
  canCustomizeTemplates: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
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

