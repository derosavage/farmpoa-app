// Auto-generated stub — run: npm run generate:types to regenerate from live schema

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type UserRole = 'farmer' | 'veterinarian' | 'admin' | 'field_agent';
export type AnimalSpecies = 'cattle' | 'goat' | 'sheep' | 'pig' | 'poultry' | 'rabbit' | 'camel' | 'donkey' | 'other';
export type AnimalSex = 'male' | 'female' | 'unknown';
export type HealthStatus = 'healthy' | 'sick' | 'quarantined' | 'recovering' | 'deceased';
export type VaccStatus = 'scheduled' | 'administered' | 'missed' | 'cancelled';
export type RecordStatus = 'draft' | 'confirmed' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'waived';
export type PaymentMethod = 'mpesa' | 'airtel_money' | 'cash' | 'bank_transfer' | 'tigopesa' | 'mtn_momo';
export type AlertChannel = 'sms' | 'push' | 'ussd' | 'whatsapp';
export type ReminderType = 'vaccination' | 'health_checkup' | 'deworming' | 'production_log' | 'payment_due' | 'follow_up';
export type ProductionMetric = 'milk_litres' | 'eggs_count' | 'weight_kg' | 'wool_kg' | 'honey_kg' | 'meat_kg';
export type LocaleCode = 'en' | 'sw' | 'am' | 'rw' | 'lg' | 'om';
export type AssignmentStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string; phone: string; phone_country: string;
          email: string | null; full_name: string; national_id: string | null;
          role: UserRole; locale: LocaleCode; timezone: string;
          is_active: boolean; is_verified: boolean; last_login_at: string | null;
          preferred_channel: AlertChannel; deleted_at: string | null;
          created_at: string; updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      farms: {
        Row: {
          id: string; owner_id: string; name: string; description: string | null;
          county: string | null; sub_county: string | null; country: string;
          size_hectares: number | null; is_active: boolean;
          deleted_at: string | null; created_at: string; updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['farms']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['farms']['Insert']>;
      };
      animals: {
        Row: {
          id: string; farm_id: string; tag_id: string; name: string | null;
          species: AnimalSpecies; breed: string | null; sex: AnimalSex;
          dob: string | null; health_status: HealthStatus;
          current_weight_kg: number | null; photo_url: string | null;
          notes: string | null; is_active: boolean;
          deleted_at: string | null; created_at: string; updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['animals']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['animals']['Insert']>;
      };
      vaccinations: {
        Row: {
          id: string; animal_id: string; vaccine_id: string;
          administered_by: string | null; scheduled_at: string;
          administered_at: string | null; next_due_at: string | null;
          status: VaccStatus; batch_number: string | null; notes: string | null;
          cost: number | null; currency: string;
          deleted_at: string | null; created_at: string; updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vaccinations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['vaccinations']['Insert']>;
      };
      health_records: {
        Row: {
          id: string; animal_id: string; vet_id: string | null; farm_id: string;
          visit_date: string; diagnosis_en: string | null; diagnosis_sw: string | null;
          treatment_en: string | null; treatment_sw: string | null;
          medications: Json | null; status: RecordStatus;
          follow_up_at: string | null; consult_cost: number | null; currency: string;
          deleted_at: string | null; created_at: string; updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['health_records']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['health_records']['Insert']>;
      };
      production_records: {
        Row: {
          id: string; animal_id: string; farm_id: string; recorded_by: string | null;
          log_date: string; metric: ProductionMetric; value: number;
          session: string | null; notes: string | null;
          deleted_at: string | null; created_at: string; updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['production_records']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['production_records']['Insert']>;
      };
      reminders: {
        Row: {
          id: string; user_id: string; animal_id: string | null; farm_id: string | null;
          type: ReminderType; channel: AlertChannel; title_en: string;
          title_sw: string | null; message_en: string; message_sw: string | null;
          scheduled_at: string; sent_at: string | null; status: string;
          provider_ref: string | null; deleted_at: string | null;
          created_at: string; updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reminders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reminders']['Insert']>;
      };
      payments: {
        Row: {
          id: string; payer_id: string; payee_id: string | null; farm_id: string | null;
          amount: number; currency: string; method: PaymentMethod; status: PaymentStatus;
          reference: string | null; description_en: string | null; description_sw: string | null;
          paid_at: string | null; created_at: string; updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      vet_assignments: {
        Row: {
          id: string; vet_id: string; farm_id: string; assigned_by: string;
          status: AssignmentStatus; assignment_date: string; expiry_date: string | null;
          scope: string | null; notes: string | null;
          deleted_at: string | null; created_at: string; updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vet_assignments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['vet_assignments']['Insert']>;
      };
    };
    Views: {
      v_vaccinations_due: { Row: Record<string, unknown> };
      v_farm_production_30d: { Row: Record<string, unknown> };
    };
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
}
