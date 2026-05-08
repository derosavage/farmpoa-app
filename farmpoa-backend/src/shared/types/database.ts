// Auto-generated Supabase DB types (excerpt — generate full version with: supabase gen types typescript)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          phone_country: string
          email: string | null
          full_name: string
          national_id: string | null
          role: 'farmer' | 'veterinarian' | 'admin' | 'field_agent'
          locale: 'en' | 'sw' | 'am' | 'rw' | 'lg' | 'om'
          timezone: string
          is_active: boolean
          is_verified: boolean
          last_login_at: string | null
          preferred_channel: 'sms' | 'push' | 'ussd' | 'whatsapp'
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      farms: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          county: string | null
          sub_county: string | null
          ward: string | null
          country: string
          size_hectares: number | null
          registration_no: string | null
          is_active: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['farms']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['farms']['Insert']>
      }
      animals: {
        Row: {
          id: string
          farm_id: string
          tag_id: string
          name: string | null
          species: 'cattle' | 'goat' | 'sheep' | 'pig' | 'poultry' | 'rabbit' | 'camel' | 'donkey' | 'other'
          breed: string | null
          sex: 'male' | 'female' | 'unknown'
          dob: string | null
          dob_estimated: boolean
          dam_id: string | null
          sire_id: string | null
          purchase_date: string | null
          purchase_price: number | null
          purchase_currency: string
          health_status: 'healthy' | 'sick' | 'quarantined' | 'recovering' | 'deceased'
          current_weight_kg: number | null
          photo_url: string | null
          notes: string | null
          is_active: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['animals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['animals']['Insert']>
      }
      vaccinations: {
        Row: {
          id: string
          animal_id: string
          vaccine_id: string
          administered_by: string | null
          scheduled_at: string
          administered_at: string | null
          next_due_at: string | null
          status: 'scheduled' | 'administered' | 'missed' | 'cancelled'
          batch_number: string | null
          dose_given_ml: number | null
          adverse_reaction: string | null
          cost: number | null
          currency: string
          notes: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['vaccinations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['vaccinations']['Insert']>
      }
      health_records: {
        Row: {
          id: string
          animal_id: string
          vet_id: string | null
          farm_id: string
          visit_date: string
          chief_complaint: string | null
          diagnosis_en: string | null
          diagnosis_sw: string | null
          icd_code: string | null
          treatment_en: string | null
          treatment_sw: string | null
          medications: unknown | null
          temperature_c: number | null
          weight_kg: number | null
          heart_rate_bpm: number | null
          status: 'draft' | 'confirmed' | 'cancelled'
          follow_up_at: string | null
          outcome: string | null
          attachments: string[] | null
          consult_cost: number | null
          currency: string
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['health_records']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['health_records']['Insert']>
      }
      production_records: {
        Row: {
          id: string
          animal_id: string
          farm_id: string
          recorded_by: string | null
          log_date: string
          metric: 'milk_litres' | 'eggs_count' | 'weight_kg' | 'wool_kg' | 'honey_kg' | 'meat_kg'
          value: number
          unit_label: string | null
          quality_grade: string | null
          session: string | null
          notes: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['production_records']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['production_records']['Insert']>
      }
      reminders: {
        Row: {
          id: string
          user_id: string
          animal_id: string | null
          farm_id: string | null
          related_id: string | null
          related_table: string | null
          type: 'vaccination' | 'health_checkup' | 'deworming' | 'production_log' | 'payment_due' | 'follow_up'
          channel: 'sms' | 'push' | 'ussd' | 'whatsapp'
          title_en: string
          title_sw: string | null
          message_en: string
          message_sw: string | null
          scheduled_at: string
          sent_at: string | null
          status: string
          retry_count: number
          provider_ref: string | null
          provider_response: unknown | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reminders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['reminders']['Insert']>
      }
      payments: {
        Row: {
          id: string
          payer_id: string
          payee_id: string | null
          farm_id: string | null
          related_id: string | null
          related_table: string | null
          amount: number
          currency: string
          exchange_rate: number
          method: 'mpesa' | 'airtel_money' | 'cash' | 'bank_transfer' | 'tigopesa' | 'mtn_momo'
          status: 'pending' | 'completed' | 'failed' | 'refunded' | 'waived'
          reference: string | null
          provider_ref: string | null
          provider_response: unknown | null
          description_en: string | null
          description_sw: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      vet_assignments: {
        Row: {
          id: string
          vet_id: string
          farm_id: string
          assigned_by: string
          status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
          assignment_date: string
          expiry_date: string | null
          scheduled_visit: string | null
          visited_at: string | null
          scope: string | null
          notes: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['vet_assignments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['vet_assignments']['Insert']>
      }
    }
    Views: {
      v_vaccinations_due: {
        Row: {
          id: string
          tag_id: string
          animal_name: string | null
          species: string
          farm_name: string
          owner_phone: string
          locale: string
          vaccine_name: string
          vaccine_name_sw: string | null
          next_due_at: string
        }
      }
      v_farm_production_30d: {
        Row: {
          farm_id: string
          farm_name: string
          metric: string
          total_value: number
          avg_daily: number
          min_value: number
          max_value: number
          record_count: number
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
