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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      advanced_image_results: {
        Row: {
          analysis_timestamp: string
          batch_id: string
          crop_health: Json | null
          disease_analysis: Json | null
          error_message: string | null
          growth_stage: Json | null
          id: string
          image_url: string
          overall_score: number | null
          pest_analysis: Json | null
          recommendations: string[] | null
          soil_quality: Json | null
          status: string | null
        }
        Insert: {
          analysis_timestamp?: string
          batch_id: string
          crop_health?: Json | null
          disease_analysis?: Json | null
          error_message?: string | null
          growth_stage?: Json | null
          id?: string
          image_url: string
          overall_score?: number | null
          pest_analysis?: Json | null
          recommendations?: string[] | null
          soil_quality?: Json | null
          status?: string | null
        }
        Update: {
          analysis_timestamp?: string
          batch_id?: string
          crop_health?: Json | null
          disease_analysis?: Json | null
          error_message?: string | null
          growth_stage?: Json | null
          id?: string
          image_url?: string
          overall_score?: number | null
          pest_analysis?: Json | null
          recommendations?: string[] | null
          soil_quality?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advanced_image_results_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batch_image_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          field_id: string | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          message: string
          resolved_at: string | null
          sensor_id: string | null
          severity: string | null
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          field_id?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message: string
          resolved_at?: string | null
          sensor_id?: string | null
          severity?: string | null
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          field_id?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message?: string
          resolved_at?: string | null
          sensor_id?: string | null
          severity?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_image_analysis: {
        Row: {
          analysis_type: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          field_id: string | null
          id: string
          results_summary: Json | null
          status: string
          total_images: number
          user_id: string
        }
        Insert: {
          analysis_type?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          field_id?: string | null
          id?: string
          results_summary?: Json | null
          status?: string
          total_images?: number
          user_id: string
        }
        Update: {
          analysis_type?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          field_id?: string | null
          id?: string
          results_summary?: Json | null
          status?: string
          total_images?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_image_analysis_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      fields: {
        Row: {
          area_hectares: number | null
          created_at: string | null
          crop_type: string | null
          description: string | null
          health_status: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area_hectares?: number | null
          created_at?: string | null
          crop_type?: string | null
          description?: string | null
          health_status?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area_hectares?: number | null
          created_at?: string | null
          crop_type?: string | null
          description?: string | null
          health_status?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      image_analysis: {
        Row: {
          analysis_status: string | null
          confidence_score: number | null
          created_at: string | null
          disease_detected: boolean | null
          disease_type: string | null
          field_id: string | null
          health_score: number | null
          id: string
          image_url: string
          recommendations: string | null
          updated_at: string | null
          user_id: string
          vegetation_index: number | null
        }
        Insert: {
          analysis_status?: string | null
          confidence_score?: number | null
          created_at?: string | null
          disease_detected?: boolean | null
          disease_type?: string | null
          field_id?: string | null
          health_score?: number | null
          id?: string
          image_url: string
          recommendations?: string | null
          updated_at?: string | null
          user_id: string
          vegetation_index?: number | null
        }
        Update: {
          analysis_status?: string | null
          confidence_score?: number | null
          created_at?: string | null
          disease_detected?: boolean | null
          disease_type?: string | null
          field_id?: string | null
          health_score?: number | null
          id?: string
          image_url?: string
          recommendations?: string | null
          updated_at?: string | null
          user_id?: string
          vegetation_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "image_analysis_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      predictive_analytics: {
        Row: {
          accuracy_score: number | null
          actual_outcome: Json | null
          confidence_score: number | null
          created_at: string
          field_id: string | null
          id: string
          prediction_data: Json
          prediction_date: string
          prediction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          actual_outcome?: Json | null
          confidence_score?: number | null
          created_at?: string
          field_id?: string | null
          id?: string
          prediction_data: Json
          prediction_date: string
          prediction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          actual_outcome?: Json | null
          confidence_score?: number | null
          created_at?: string
          field_id?: string | null
          id?: string
          prediction_data?: Json
          prediction_date?: string
          prediction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictive_analytics_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          file_size: number | null
          file_url: string | null
          id: string
          parameters: Json | null
          report_type: string
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          parameters?: Json | null
          report_type: string
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          parameters?: Json | null
          report_type?: string
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      sensor_readings: {
        Row: {
          id: string
          quality_score: number | null
          recorded_at: string | null
          sensor_id: string
          unit: string
          value: number
        }
        Insert: {
          id?: string
          quality_score?: number | null
          recorded_at?: string | null
          sensor_id: string
          unit: string
          value: number
        }
        Update: {
          id?: string
          quality_score?: number | null
          recorded_at?: string | null
          sensor_id?: string
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      sensors: {
        Row: {
          battery_level: number | null
          created_at: string | null
          field_id: string
          id: string
          last_reading_at: string | null
          location_lat: number | null
          location_lng: number | null
          name: string
          sensor_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          battery_level?: number | null
          created_at?: string | null
          field_id: string
          id?: string
          last_reading_at?: string | null
          location_lat?: number | null
          location_lng?: number | null
          name: string
          sensor_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          battery_level?: number | null
          created_at?: string | null
          field_id?: string
          id?: string
          last_reading_at?: string | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          sensor_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensors_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_correlations: {
        Row: {
          analysis_date: string
          correlation_score: number | null
          created_at: string
          crop_response: Json | null
          field_id: string
          id: string
          weather_data: Json
        }
        Insert: {
          analysis_date: string
          correlation_score?: number | null
          created_at?: string
          crop_response?: Json | null
          field_id: string
          id?: string
          weather_data: Json
        }
        Update: {
          analysis_date?: string
          correlation_score?: number | null
          created_at?: string
          crop_response?: Json | null
          field_id?: string
          id?: string
          weather_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "weather_correlations_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
