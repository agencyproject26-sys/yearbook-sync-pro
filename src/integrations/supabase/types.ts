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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          created_at: string
          customer_id: string | null
          date: string
          deleted_at: string | null
          id: string
          notes: string | null
          time: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          date: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          time: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          date?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          time?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          assigned_to: string | null
          case_number: string
          closed_at: string | null
          created_at: string
          customer_id: string | null
          deleted_at: string | null
          description: string | null
          id: string
          order_id: string | null
          priority: string
          resolution: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_number: string
          closed_at?: string | null
          created_at?: string
          customer_id?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          priority?: string
          resolution?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_number?: string
          closed_at?: string | null
          created_at?: string
          customer_id?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          priority?: string
          resolution?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          signature_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          signature_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          signature_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string
          created_at: string
          deleted_at: string | null
          id: string
          kecamatan: string | null
          kelurahan: string | null
          name: string
          phones: string[] | null
          pic_name: string
          pics: Json | null
          sph_link: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          kecamatan?: string | null
          kelurahan?: string | null
          name: string
          phones?: string[] | null
          pic_name: string
          pics?: Json | null
          sph_link?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          kecamatan?: string | null
          kelurahan?: string | null
          name?: string
          phones?: string[] | null
          pic_name?: string
          pics?: Json | null
          sph_link?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          company_logo_url: string | null
          created_at: string
          customer_id: string
          deleted_at: string | null
          dp_amount: number | null
          dp_date: string | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string | null
          items: Json | null
          mou_link: string | null
          order_id: string | null
          payment_terms: Json | null
          pelunasan_amount: number | null
          pelunasan_date: string | null
          status: string
        }
        Insert: {
          amount?: number
          company_logo_url?: string | null
          created_at?: string
          customer_id: string
          deleted_at?: string | null
          dp_amount?: number | null
          dp_date?: string | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string | null
          items?: Json | null
          mou_link?: string | null
          order_id?: string | null
          payment_terms?: Json | null
          pelunasan_amount?: number | null
          pelunasan_date?: string | null
          status?: string
        }
        Update: {
          amount?: number
          company_logo_url?: string | null
          created_at?: string
          customer_id?: string
          deleted_at?: string | null
          dp_amount?: number | null
          dp_date?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string | null
          items?: Json | null
          mou_link?: string | null
          order_id?: string | null
          payment_terms?: Json | null
          pelunasan_amount?: number | null
          pelunasan_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cetak_cover_status: string | null
          cetak_isi_status: string | null
          cetak_packaging_status: string | null
          created_at: string
          customer_id: string
          deleted_at: string | null
          design_cover_link: string | null
          design_cover_status: string | null
          design_isi_link: string | null
          design_isi_status: string | null
          design_packaging_link: string | null
          design_packaging_status: string | null
          drive_link: string | null
          gmail_email: string | null
          google_doc_link: string | null
          has_drive: boolean | null
          has_mou: boolean | null
          has_spreadsheet: boolean | null
          id: string
          mou_link: string | null
          notes: string | null
          order_number: string
          spreadsheet_link: string | null
          status: string
          updated_at: string
          value: number
          wa_desc: string | null
          wa_group_link: string | null
        }
        Insert: {
          cetak_cover_status?: string | null
          cetak_isi_status?: string | null
          cetak_packaging_status?: string | null
          created_at?: string
          customer_id: string
          deleted_at?: string | null
          design_cover_link?: string | null
          design_cover_status?: string | null
          design_isi_link?: string | null
          design_isi_status?: string | null
          design_packaging_link?: string | null
          design_packaging_status?: string | null
          drive_link?: string | null
          gmail_email?: string | null
          google_doc_link?: string | null
          has_drive?: boolean | null
          has_mou?: boolean | null
          has_spreadsheet?: boolean | null
          id?: string
          mou_link?: string | null
          notes?: string | null
          order_number: string
          spreadsheet_link?: string | null
          status?: string
          updated_at?: string
          value?: number
          wa_desc?: string | null
          wa_group_link?: string | null
        }
        Update: {
          cetak_cover_status?: string | null
          cetak_isi_status?: string | null
          cetak_packaging_status?: string | null
          created_at?: string
          customer_id?: string
          deleted_at?: string | null
          design_cover_link?: string | null
          design_cover_status?: string | null
          design_isi_link?: string | null
          design_isi_status?: string | null
          design_packaging_link?: string | null
          design_packaging_status?: string | null
          drive_link?: string | null
          gmail_email?: string | null
          google_doc_link?: string | null
          has_drive?: boolean | null
          has_mou?: boolean | null
          has_spreadsheet?: boolean | null
          id?: string
          mou_link?: string | null
          notes?: string | null
          order_number?: string
          spreadsheet_link?: string | null
          status?: string
          updated_at?: string
          value?: number
          wa_desc?: string | null
          wa_group_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          invoice_id: string
          payment_date: string
          pic_name: string | null
          proof_link: string | null
          receipt_number: string
        }
        Insert: {
          amount: number
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          invoice_id: string
          payment_date: string
          pic_name?: string | null
          proof_link?: string | null
          receipt_number: string
        }
        Update: {
          amount?: number
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string
          payment_date?: string
          pic_name?: string | null
          proof_link?: string | null
          receipt_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_approved: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_approved?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_approved?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      salaries: {
        Row: {
          amount: number
          category: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          order_id: string | null
          payment_date: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_id?: string | null
          payment_date: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_id?: string | null
          payment_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "salaries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      can_modify_calendar: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_owner: { Args: { _user_id: string }; Returns: boolean }
      is_authenticated: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "owner" | "staff" | "calendar_only"
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
      app_role: ["admin", "owner", "staff", "calendar_only"],
    },
  },
} as const
