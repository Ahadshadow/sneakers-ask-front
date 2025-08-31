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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_name: string
          id: string
          order_date: string
          order_number: string
          shipping_city: string
          shipping_country: string
          shipping_postal_code: string
          shipping_street: string
          shopify_order_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_name: string
          id?: string
          order_date: string
          order_number: string
          shipping_city: string
          shipping_country: string
          shipping_postal_code: string
          shipping_street: string
          shopify_order_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_name?: string
          id?: string
          order_date?: string
          order_number?: string
          shipping_city?: string
          shipping_country?: string
          shipping_postal_code?: string
          shipping_street?: string
          shopify_order_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      product_orders: {
        Row: {
          created_at: string | null
          direct_shipping_status:
            | Database["public"]["Enums"]["direct_shipping_status"]
            | null
          id: string
          is_confirmed: boolean | null
          margin_type: string | null
          order_id: string
          payout_date: string | null
          payout_schedule: Database["public"]["Enums"]["payout_schedule"] | null
          payout_status: Database["public"]["Enums"]["payout_status"] | null
          product_id: string
          quantity: number
          seller_id: string
          seller_payout: number | null
          shipping_provider:
            | Database["public"]["Enums"]["shipping_provider"]
            | null
          total_price: number
          tracking_number: string | null
          unit_price: number
          updated_at: string | null
          vat_amount: number | null
          vat_rate: number | null
          vat_scheme: Database["public"]["Enums"]["vat_scheme"] | null
          warehouse_shipping_status:
            | Database["public"]["Enums"]["warehouse_shipping_status"]
            | null
        }
        Insert: {
          created_at?: string | null
          direct_shipping_status?:
            | Database["public"]["Enums"]["direct_shipping_status"]
            | null
          id?: string
          is_confirmed?: boolean | null
          margin_type?: string | null
          order_id: string
          payout_date?: string | null
          payout_schedule?:
            | Database["public"]["Enums"]["payout_schedule"]
            | null
          payout_status?: Database["public"]["Enums"]["payout_status"] | null
          product_id: string
          quantity?: number
          seller_id: string
          seller_payout?: number | null
          shipping_provider?:
            | Database["public"]["Enums"]["shipping_provider"]
            | null
          total_price: number
          tracking_number?: string | null
          unit_price: number
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
          vat_scheme?: Database["public"]["Enums"]["vat_scheme"] | null
          warehouse_shipping_status?:
            | Database["public"]["Enums"]["warehouse_shipping_status"]
            | null
        }
        Update: {
          created_at?: string | null
          direct_shipping_status?:
            | Database["public"]["Enums"]["direct_shipping_status"]
            | null
          id?: string
          is_confirmed?: boolean | null
          margin_type?: string | null
          order_id?: string
          payout_date?: string | null
          payout_schedule?:
            | Database["public"]["Enums"]["payout_schedule"]
            | null
          payout_status?: Database["public"]["Enums"]["payout_status"] | null
          product_id?: string
          quantity?: number
          seller_id?: string
          seller_payout?: number | null
          shipping_provider?:
            | Database["public"]["Enums"]["shipping_provider"]
            | null
          total_price?: number
          tracking_number?: string | null
          unit_price?: number
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
          vat_scheme?: Database["public"]["Enums"]["vat_scheme"] | null
          warehouse_shipping_status?:
            | Database["public"]["Enums"]["warehouse_shipping_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "product_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          created_at: string | null
          currency: string | null
          description: string | null
          dimensions: Json | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          seller_id: string
          sku: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          base_price: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          seller_id: string
          sku?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          seller_id?: string
          sku?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          password_changed_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          password_changed_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          password_changed_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sellers: {
        Row: {
          account_holder: string | null
          annual_revenue: number | null
          bank_name: string | null
          bic: string | null
          business_name: string | null
          city: string | null
          compliance_status: string | null
          country: string
          created_at: string | null
          email: string
          first_name: string | null
          iban: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          phone: string | null
          postal_code: string | null
          seller_type: Database["public"]["Enums"]["seller_type"]
          street: string | null
          tax_resident: boolean | null
          transaction_count: number | null
          updated_at: string | null
          user_id: string | null
          vat_number: string | null
          vat_registered: boolean | null
          withholding_tax_rate: number | null
        }
        Insert: {
          account_holder?: string | null
          annual_revenue?: number | null
          bank_name?: string | null
          bic?: string | null
          business_name?: string | null
          city?: string | null
          compliance_status?: string | null
          country: string
          created_at?: string | null
          email: string
          first_name?: string | null
          iban?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          seller_type: Database["public"]["Enums"]["seller_type"]
          street?: string | null
          tax_resident?: boolean | null
          transaction_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          vat_number?: string | null
          vat_registered?: boolean | null
          withholding_tax_rate?: number | null
        }
        Update: {
          account_holder?: string | null
          annual_revenue?: number | null
          bank_name?: string | null
          bic?: string | null
          business_name?: string | null
          city?: string | null
          compliance_status?: string | null
          country?: string
          created_at?: string | null
          email?: string
          first_name?: string | null
          iban?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          seller_type?: Database["public"]["Enums"]["seller_type"]
          street?: string | null
          tax_resident?: boolean | null
          transaction_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          vat_number?: string | null
          vat_registered?: boolean | null
          withholding_tax_rate?: number | null
        }
        Relationships: []
      }
      shipments: {
        Row: {
          city: string
          confirmation_url: string | null
          country: string
          created_at: string | null
          delivered_at: string | null
          id: string
          postal_code: string
          product_order_id: string
          provider: Database["public"]["Enums"]["shipping_provider"]
          recipient_name: string
          shipped_at: string | null
          shipping_label_url: string | null
          street: string
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          city: string
          confirmation_url?: string | null
          country: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          postal_code: string
          product_order_id: string
          provider: Database["public"]["Enums"]["shipping_provider"]
          recipient_name: string
          shipped_at?: string | null
          shipping_label_url?: string | null
          street: string
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string
          confirmation_url?: string | null
          country?: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          postal_code?: string
          product_order_id?: string
          provider?: Database["public"]["Enums"]["shipping_provider"]
          recipient_name?: string
          shipped_at?: string | null
          shipping_label_url?: string | null
          street?: string
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_product_order_id_fkey"
            columns: ["product_order_id"]
            isOneToOne: false
            referencedRelation: "product_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          order_id: string
          payout_timing: string
          product_name: string
          seller_email: string
          seller_name: string
          shipment_method: string
          shipper_email: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          order_id: string
          payout_timing: string
          product_name: string
          seller_email: string
          seller_name: string
          shipment_method: string
          shipper_email: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string
          payout_timing?: string
          product_name?: string
          seller_email?: string
          seller_name?: string
          shipment_method?: string
          shipper_email?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_vat_amount: {
        Args: {
          margin_percentage?: number
          payout: number
          vat_rate: number
          vat_scheme: Database["public"]["Enums"]["vat_scheme"]
        }
        Returns: number
      }
      check_seller_access: {
        Args: { seller_id_param: string; seller_user_id: string }
        Returns: boolean
      }
      delete_user_by_admin: {
        Args: { user_id_to_delete: string }
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer_care" | "finance" | "admin"
      direct_shipping_status: "ready_for_shipment" | "shipped" | "delivered"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payout_schedule: "before_shipment" | "after_arrival"
      payout_status:
        | "pending"
        | "scheduled"
        | "processing"
        | "completed"
        | "failed"
      seller_type: "private" | "business"
      shipping_provider:
        | "discord_ups"
        | "manual_upload"
        | "sendcloud_dpd"
        | "sendcloud_ups"
      vat_scheme: "margin" | "regular" | "exempt"
      warehouse_shipping_status:
        | "ready_for_shipment"
        | "on_the_way_to_warehouse"
        | "arrived_at_warehouse"
        | "verified"
        | "cancelled"
        | "shipped"
        | "delivered"
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
      app_role: ["customer_care", "finance", "admin"],
      direct_shipping_status: ["ready_for_shipment", "shipped", "delivered"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payout_schedule: ["before_shipment", "after_arrival"],
      payout_status: [
        "pending",
        "scheduled",
        "processing",
        "completed",
        "failed",
      ],
      seller_type: ["private", "business"],
      shipping_provider: [
        "discord_ups",
        "manual_upload",
        "sendcloud_dpd",
        "sendcloud_ups",
      ],
      vat_scheme: ["margin", "regular", "exempt"],
      warehouse_shipping_status: [
        "ready_for_shipment",
        "on_the_way_to_warehouse",
        "arrived_at_warehouse",
        "verified",
        "cancelled",
        "shipped",
        "delivered",
      ],
    },
  },
} as const
