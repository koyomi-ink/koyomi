export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      artists: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          role: string | null
          studio_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          is_active?: boolean
          role?: string | null
          studio_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          role?: string | null
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artists_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      artwork_items: {
        Row: {
          artist_id: string | null
          category: string
          created_at: string
          crop_settings: Json | null
          deposit_amount: number | null
          estimated_duration_min: number | null
          id: string
          image_url: string
          is_repeatable: boolean
          max_price: number | null
          min_price: number | null
          order_index: number
          pricing_mode: string | null
          pricing_set_id: string | null
          status: string | null
          studio_id: string
          tiers: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          category: string
          created_at?: string
          crop_settings?: Json | null
          deposit_amount?: number | null
          estimated_duration_min?: number | null
          id?: string
          image_url: string
          is_repeatable?: boolean
          max_price?: number | null
          min_price?: number | null
          order_index?: number
          pricing_mode?: string | null
          pricing_set_id?: string | null
          status?: string | null
          studio_id: string
          tiers?: Json | null
          type: string
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          category?: string
          created_at?: string
          crop_settings?: Json | null
          deposit_amount?: number | null
          estimated_duration_min?: number | null
          id?: string
          image_url?: string
          is_repeatable?: boolean
          max_price?: number | null
          min_price?: number | null
          order_index?: number
          pricing_mode?: string | null
          pricing_set_id?: string | null
          status?: string | null
          studio_id?: string
          tiers?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artwork_items_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artwork_items_pricing_set_id_fkey"
            columns: ["pricing_set_id"]
            isOneToOne: false
            referencedRelation: "pricing_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artwork_items_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          artist_id: string | null
          artwork_item_id: string | null
          book_notes: string | null
          booking_type: string
          buffer_minutes: number | null
          client_id: string | null
          created_at: string
          custom_details: Json | null
          deposit_amount: number | null
          duration_minutes: number | null
          id: string
          location_id: string | null
          quoted_price: number | null
          requested_slots: Json | null
          scheduled_slot_end: string | null
          scheduled_slot_start: string | null
          selected_tier: Json | null
          status: string | null
          studio_id: string
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          artwork_item_id?: string | null
          book_notes?: string | null
          booking_type: string
          buffer_minutes?: number | null
          client_id?: string | null
          created_at?: string
          custom_details?: Json | null
          deposit_amount?: number | null
          duration_minutes?: number | null
          id?: string
          location_id?: string | null
          quoted_price?: number | null
          requested_slots?: Json | null
          scheduled_slot_end?: string | null
          scheduled_slot_start?: string | null
          selected_tier?: Json | null
          status?: string | null
          studio_id: string
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          artwork_item_id?: string | null
          book_notes?: string | null
          booking_type?: string
          buffer_minutes?: number | null
          client_id?: string | null
          created_at?: string
          custom_details?: Json | null
          deposit_amount?: number | null
          duration_minutes?: number | null
          id?: string
          location_id?: string | null
          quoted_price?: number | null
          requested_slots?: Json | null
          scheduled_slot_end?: string | null
          scheduled_slot_start?: string | null
          selected_tier?: Json | null
          status?: string | null
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_artwork_item_id_fkey"
            columns: ["artwork_item_id"]
            isOneToOne: false
            referencedRelation: "artwork_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          studio_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          studio_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          maps_url: string | null
          name: string
          studio_id: string
          updated_at: string
          weekly_schedule: Json
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          maps_url?: string | null
          name: string
          studio_id: string
          updated_at?: string
          weekly_schedule?: Json
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          maps_url?: string | null
          name?: string
          studio_id?: string
          updated_at?: string
          weekly_schedule?: Json
        }
        Relationships: [
          {
            foreignKeyName: "locations_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_sets: {
        Row: {
          created_at: string
          deposit_amount: number
          estimated_duration_min: number
          id: string
          max_price: number
          min_price: number
          name: string
          studio_id: string
          target_type: string | null
          tiers: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deposit_amount: number
          estimated_duration_min?: number
          id?: string
          max_price: number
          min_price: number
          name: string
          studio_id: string
          target_type?: string | null
          tiers?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deposit_amount?: number
          estimated_duration_min?: number
          id?: string
          max_price?: number
          min_price?: number
          name?: string
          studio_id?: string
          target_type?: string | null
          tiers?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_sets_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_overrides: {
        Row: {
          created_at: string
          id: string
          intervals: Json
          is_active: boolean
          location_id: string
          override_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          intervals?: Json
          is_active: boolean
          location_id: string
          override_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          intervals?: Json
          is_active?: boolean
          location_id?: string
          override_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_overrides_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          currency: string
          id: string
          name: string
          payment_instructions: Json | null
          slug: string
          social_links: Json | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          theme: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          currency: string
          id?: string
          name: string
          payment_instructions?: Json | null
          slug: string
          social_links?: Json | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          theme?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          currency?: string
          id?: string
          name?: string
          payment_instructions?: Json | null
          slug?: string
          social_links?: Json | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          theme?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
