// Types pour l'API Bictorys

// Types de paiement selon la documentation Bictorys
// Pour checkout simple, ne pas spécifier payment_type
// Pour mobile money spécifique, utiliser les noms d'opérateurs
export type PaymentType = 'orange_money' | 'wave' | 'card' | 'Orange Money' | 'Wave';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

export interface CreateChargeRequest {
  amount: number; // Montant en centimes (ex: 10000 = 100 FCFA)
  currency: string; // XOF pour le Sénégal
  country: string; // SN pour le Sénégal
  successRedirectUrl: string;
  errorRedirectUrl: string;
  payment_type?: PaymentType; // Optionnel pour checkout (client choisit)
  operator?: string; // Pour mobile money direct (orange_money, wave)
  phone?: string; // Numéro de téléphone pour mobile money
  metadata?: {
    quote_id?: string;
    quote_number?: string;
    user_id?: string;
    client_name?: string;
  };
}

export interface CreateChargeResponse {
  id: string;
  status: PaymentStatus;
  checkout_url: string;
  amount: number;
  currency: string;
  payment_type?: PaymentType;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface WebhookPayload {
  event: string; // 'charge.succeeded', 'charge.failed', etc.
  data: {
    id: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    payment_type?: PaymentType;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
  };
}

export interface BictorysError {
  error: {
    message: string;
    code?: string;
    type?: string;
  };
}
