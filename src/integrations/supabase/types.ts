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
      admin_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      backup_settings: {
        Row: {
          auto_enabled: boolean
          backup_path: string | null
          backup_type: string | null
          bucket_name: string | null
          id: string
          interval_unit: string
          interval_value: number
          last_run_at: string | null
          next_run_at: string | null
          retention_count: number
          retention_days: number | null
          singleton: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          auto_enabled?: boolean
          backup_path?: string | null
          backup_type?: string | null
          bucket_name?: string | null
          id?: string
          interval_unit?: string
          interval_value?: number
          last_run_at?: string | null
          next_run_at?: string | null
          retention_count?: number
          retention_days?: number | null
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          auto_enabled?: boolean
          backup_path?: string | null
          backup_type?: string | null
          bucket_name?: string | null
          id?: string
          interval_unit?: string
          interval_value?: number
          last_run_at?: string | null
          next_run_at?: string | null
          retention_count?: number
          retention_days?: number | null
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      backups: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          file_path: string | null
          id: string
          size_bytes: number
          status: string
          tables: Json
          trigger: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          file_path?: string | null
          id?: string
          size_bytes?: number
          status?: string
          tables?: Json
          trigger?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          file_path?: string | null
          id?: string
          size_bytes?: number
          status?: string
          tables?: Json
          trigger?: string
        }
        Relationships: []
      }
      instagram_posts: {
        Row: {
          caption: string
          created_at: string
          external_id: string | null
          id: string
          image_url: string
          is_published: boolean
          permalink: string | null
          position: number
          posted_at: string
          source: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          caption?: string
          created_at?: string
          external_id?: string | null
          id?: string
          image_url: string
          is_published?: boolean
          permalink?: string | null
          position?: number
          posted_at?: string
          source?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          caption?: string
          created_at?: string
          external_id?: string | null
          id?: string
          image_url?: string
          is_published?: boolean
          permalink?: string | null
          position?: number
          posted_at?: string
          source?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          created_at: string
          draft: Json
          id: string
          is_published: boolean
          published: Json
          slug: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          draft?: Json
          id?: string
          is_published?: boolean
          published?: Json
          slug: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          draft?: Json
          id?: string
          is_published?: boolean
          published?: Json
          slug?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          conteudo: string | null
          created_at: string | null
          id: number
          midia_url: string | null
          titulo: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string | null
          id?: number
          midia_url?: string | null
          titulo: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string | null
          id?: number
          midia_url?: string | null
          titulo?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      questionnaire_responses: {
        Row: {
          address: string
          allowed_items: Json | null
          changing_room_informed: boolean | null
          character_count: string | null
          city: string
          complement: string | null
          contact_person_name: string
          contact_person_phone: string
          created_at: string
          event_date: string
          event_type: string
          everyone_informed: boolean | null
          extra_services: Json | null
          has_screen: string | null
          how_did_you_hear_about_us: string | null
          id: string
          invasion_type: string | null
          is_assistant_aware: boolean | null
          is_aware_of_card_fees: string | null
          municipality: string
          observations: string | null
          other_allowed_items: string | null
          other_extra_services: string | null
          parking_payment_pref: string | null
          performance_time: string
          pix_bank: string | null
          pix_holder_name: string | null
          pix_key: string | null
          pix_key_type: string | null
          pix_qr_code_url: string | null
          primary_name: string
          secondary_name: string | null
          selected_coupon: string | null
          social_media_1: string | null
          social_media_2: string | null
          social_media_3: string | null
          stay_duration: string | null
          venue_name: string
          zip_code: string
        }
        Insert: {
          address: string
          allowed_items?: Json | null
          changing_room_informed?: boolean | null
          character_count?: string | null
          city: string
          complement?: string | null
          contact_person_name: string
          contact_person_phone: string
          created_at?: string
          event_date: string
          event_type: string
          everyone_informed?: boolean | null
          extra_services?: Json | null
          has_screen?: string | null
          how_did_you_hear_about_us?: string | null
          id?: string
          invasion_type?: string | null
          is_assistant_aware?: boolean | null
          is_aware_of_card_fees?: string | null
          municipality: string
          observations?: string | null
          other_allowed_items?: string | null
          other_extra_services?: string | null
          parking_payment_pref?: string | null
          performance_time: string
          pix_bank?: string | null
          pix_holder_name?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          pix_qr_code_url?: string | null
          primary_name: string
          secondary_name?: string | null
          selected_coupon?: string | null
          social_media_1?: string | null
          social_media_2?: string | null
          social_media_3?: string | null
          stay_duration?: string | null
          venue_name: string
          zip_code: string
        }
        Update: {
          address?: string
          allowed_items?: Json | null
          changing_room_informed?: boolean | null
          character_count?: string | null
          city?: string
          complement?: string | null
          contact_person_name?: string
          contact_person_phone?: string
          created_at?: string
          event_date?: string
          event_type?: string
          everyone_informed?: boolean | null
          extra_services?: Json | null
          has_screen?: string | null
          how_did_you_hear_about_us?: string | null
          id?: string
          invasion_type?: string | null
          is_assistant_aware?: boolean | null
          is_aware_of_card_fees?: string | null
          municipality?: string
          observations?: string | null
          other_allowed_items?: string | null
          other_extra_services?: string | null
          parking_payment_pref?: string | null
          performance_time?: string
          pix_bank?: string | null
          pix_holder_name?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          pix_qr_code_url?: string | null
          primary_name?: string
          secondary_name?: string | null
          selected_coupon?: string | null
          social_media_1?: string | null
          social_media_2?: string | null
          social_media_3?: string | null
          stay_duration?: string | null
          venue_name?: string
          zip_code?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          draft_value: Json | null
          key: string
          language_config: Json | null
          seo_config: Json | null
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          draft_value?: Json | null
          key: string
          language_config?: Json | null
          seo_config?: Json | null
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          draft_value?: Json | null
          key?: string
          language_config?: Json | null
          seo_config?: Json | null
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      site_media: {
        Row: {
          category: string | null
          created_at: string | null
          file_type: string
          filename: string
          id: string
          metadata: Json | null
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          file_type: string
          filename: string
          id?: string
          metadata?: Json | null
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          file_type?: string
          filename?: string
          id?: string
          metadata?: Json | null
          url?: string
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          is_home: boolean | null
          is_published: boolean | null
          seo_metadata: Json | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          is_home?: boolean | null
          is_published?: boolean | null
          seo_metadata?: Json | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          is_home?: boolean | null
          is_published?: boolean | null
          seo_metadata?: Json | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_admin_action: {
        Args: {
          _action: string
          _details?: Json
          _entity_id?: string
          _entity_type?: string
        }
        Returns: string
      }
      owner_exists: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin"],
    },
  },
} as const
