export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      customers: {
        Row: {
          bonus_threshold: number;
          bonuses_granted: number;
          created_at: string;
          deleted_at: string | null;
          id: string;
          nama: string;
          owner_uid: string;
        };
        Insert: {
          bonus_threshold?: number;
          bonuses_granted?: number;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          nama: string;
          owner_uid?: string;
        };
        Update: {
          bonus_threshold?: number;
          bonuses_granted?: number;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          nama?: string;
          owner_uid?: string;
        };
        Relationships: [];
      };
      discount_steps: {
        Row: {
          customer_id: string;
          id: string;
          owner_uid: string;
          percentage: number;
          product_type: string;
          step_order: number;
        };
        Insert: {
          customer_id: string;
          id?: string;
          owner_uid?: string;
          percentage: number;
          product_type: string;
          step_order: number;
        };
        Update: {
          customer_id?: string;
          id?: string;
          owner_uid?: string;
          percentage?: number;
          product_type?: string;
          step_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "discount_steps_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          harga_base: number;
          harga_modal: number;
          id: string;
          nama: string;
          owner_uid: string;
          tipe: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          harga_base: number;
          harga_modal: number;
          id?: string;
          nama: string;
          owner_uid?: string;
          tipe: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          harga_base?: number;
          harga_modal?: number;
          id?: string;
          nama?: string;
          owner_uid?: string;
          tipe?: string;
        };
        Relationships: [];
      };
      transaction_lines: {
        Row: {
          discounted_price: number;
          harga_base_snap: number;
          harga_modal_snap: number;
          id: string;
          line_laba_hl: number;
          line_omzet: number;
          owner_uid: string;
          product_id: string;
          product_type: string;
          qty: number;
          transaction_id: string;
        };
        Insert: {
          discounted_price: number;
          harga_base_snap: number;
          harga_modal_snap: number;
          id?: string;
          line_laba_hl: number;
          line_omzet: number;
          owner_uid?: string;
          product_id: string;
          product_type: string;
          qty: number;
          transaction_id: string;
        };
        Update: {
          discounted_price?: number;
          harga_base_snap?: number;
          harga_modal_snap?: number;
          id?: string;
          line_laba_hl?: number;
          line_omzet?: number;
          owner_uid?: string;
          product_id?: string;
          product_type?: string;
          qty?: number;
          transaction_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transaction_lines_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transaction_lines_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          created_at: string;
          customer_id: string;
          deskripsi: string | null;
          id: string;
          is_bonus: boolean;
          nomor_bon: string;
          ongkir: number;
          owner_uid: string;
          status: string;
          tanggal: string;
          tanggal_lunas: string | null;
        };
        Insert: {
          created_at?: string;
          customer_id: string;
          deskripsi?: string | null;
          id?: string;
          is_bonus?: boolean;
          nomor_bon: string;
          ongkir?: number;
          owner_uid?: string;
          status?: string;
          tanggal?: string;
          tanggal_lunas?: string | null;
        };
        Update: {
          created_at?: string;
          customer_id?: string;
          deskripsi?: string | null;
          id?: string;
          is_bonus?: boolean;
          nomor_bon?: string;
          ongkir?: number;
          owner_uid?: string;
          status?: string;
          tanggal?: string;
          tanggal_lunas?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      settle_month: {
        Args: {
          p_customer_id: string;
          p_month: number;
          p_tanggal_lunas?: string;
          p_year: number;
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
