export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone: string;
          full_name: string;
          business_name: string | null;
          profession:
            | 'peintre'
            | 'mecanicien'
            | 'quincaillier'
            | 'electricien'
            | 'plombier'
            | 'autre';
          address: string | null;
          ninea: string | null;
          logo_url: string | null;
          signature_url: string | null;
          default_payment_terms: string | null;
          plan: 'free' | 'pro';
          plan_expires_at: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          phone: string;
          full_name: string;
          business_name?: string | null;
          profession:
            | 'peintre'
            | 'mecanicien'
            | 'quincaillier'
            | 'electricien'
            | 'plombier'
            | 'autre';
          address?: string | null;
          ninea?: string | null;
          logo_url?: string | null;
          signature_url?: string | null;
          default_payment_terms?: string | null;
          plan?: 'free' | 'pro';
          plan_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string;
          full_name?: string;
          business_name?: string | null;
          profession?:
            | 'peintre'
            | 'mecanicien'
            | 'quincaillier'
            | 'electricien'
            | 'plombier'
            | 'autre';
          address?: string | null;
          ninea?: string | null;
          logo_url?: string | null;
          signature_url?: string | null;
          default_payment_terms?: string | null;
          plan?: 'free' | 'pro';
          plan_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          email: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          phone?: string;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'clients_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      catalog_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          unit_price: number;
          unit: string;
          category: string | null;
          is_template: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          unit_price: number;
          unit: string;
          category?: string | null;
          is_template?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          unit_price?: number;
          unit?: string;
          category?: string | null;
          is_template?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'catalog_items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      quotes: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          quote_number: string;
          status: 'draft' | 'sent' | 'accepted' | 'refused' | 'expired';
          document_type: 'devis' | 'facture';
          service_description: string | null;
          date: string;
          valid_until: string;
          subtotal: number;
          discount_type: 'percent' | 'fixed' | null;
          discount_value: number | null;
          discount_amount: number;
          tax_rate: number;
          tax_amount: number;
          total: number;
          payment_terms: string | null;
          notes: string | null;
          pdf_url: string | null;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          quote_number: string;
          status?: 'draft' | 'sent' | 'accepted' | 'refused' | 'expired';
          document_type?: 'devis' | 'facture';
          service_description?: string | null;
          date: string;
          valid_until: string;
          subtotal: number;
          discount_type?: 'percent' | 'fixed' | null;
          discount_value?: number | null;
          discount_amount?: number;
          tax_rate?: number;
          tax_amount?: number;
          total: number;
          payment_terms?: string | null;
          notes?: string | null;
          pdf_url?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string;
          quote_number?: string;
          status?: 'draft' | 'sent' | 'accepted' | 'refused' | 'expired';
          document_type?: 'devis' | 'facture';
          service_description?: string | null;
          date?: string;
          valid_until?: string;
          subtotal?: number;
          discount_type?: 'percent' | 'fixed' | null;
          discount_value?: number | null;
          discount_amount?: number;
          tax_rate?: number;
          tax_amount?: number;
          total?: number;
          payment_terms?: string | null;
          notes?: string | null;
          pdf_url?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'quotes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'quotes_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          quote_id: string | null;
          bictorys_charge_id: string | null;
          amount: number;
          currency: string;
          payment_type: 'orange_money' | 'wave' | 'card' | 'stripe_card' | 'stripe_subscription';
          payment_provider: 'bictorys' | 'stripe';
          status: 'pending' | 'succeeded' | 'failed' | 'canceled';
          success_redirect_url: string | null;
          error_redirect_url: string | null;
          metadata: Record<string, any> | null;
          stripe_session_id: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | null;
          subscription_current_period_start: string | null;
          subscription_current_period_end: string | null;
          is_subscription: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quote_id?: string | null;
          bictorys_charge_id?: string | null;
          amount: number;
          currency?: string;
          payment_type: 'orange_money' | 'wave' | 'card';
          status?: 'pending' | 'succeeded' | 'failed' | 'canceled';
          success_redirect_url?: string | null;
          error_redirect_url?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quote_id?: string | null;
          bictorys_charge_id?: string | null;
          amount?: number;
          currency?: string;
          payment_type?: 'orange_money' | 'wave' | 'card';
          status?: 'pending' | 'succeeded' | 'failed' | 'canceled';
          success_redirect_url?: string | null;
          error_redirect_url?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_quote_id_fkey';
            columns: ['quote_id'];
            isOneToOne: false;
            referencedRelation: 'quotes';
            referencedColumns: ['id'];
          },
        ];
      };
      quote_items: {
        Row: {
          id: string;
          quote_id: string;
          name: string;
          description: string | null;
          quantity: number;
          unit: string;
          unit_price: number;
          amount: number;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote_id: string;
          name: string;
          description?: string | null;
          quantity: number;
          unit: string;
          unit_price: number;
          amount: number;
          order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quote_id?: string;
          name?: string;
          description?: string | null;
          quantity?: number;
          unit?: string;
          unit_price?: number;
          amount?: number;
          order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'quote_items_quote_id_fkey';
            columns: ['quote_id'];
            isOneToOne: false;
            referencedRelation: 'quotes';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_quote_number: {
        Args: { p_user_id: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

