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
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
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
            referencedRelation: "report_transaction_lines";
            referencedColumns: ["transaction_id"];
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
          bonus_units: number;
          created_at: string;
          customer_id: string;
          deleted_at: string | null;
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
          bonus_units?: number;
          created_at?: string;
          customer_id: string;
          deleted_at?: string | null;
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
          bonus_units?: number;
          created_at?: string;
          customer_id?: string;
          deleted_at?: string | null;
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
      monthly_report_totals: {
        Row: {
          bon_lunas_count: number | null;
          bon_piutang_count: number | null;
          bulan: number | null;
          customer_id: string | null;
          customer_name: string | null;
          laba_lunas: number | null;
          omzet_bonus: number | null;
          omzet_lunas: number | null;
          omzet_piutang: number | null;
          owner_uid: string | null;
          product_type: string | null;
          tahun: number | null;
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
      report_transaction_lines: {
        Row: {
          bonus_units: number | null;
          bulan: number | null;
          customer_id: string | null;
          customer_name: string | null;
          deleted_at: string | null;
          discounted_price: number | null;
          is_bonus: boolean | null;
          line_id: string | null;
          line_laba_hl: number | null;
          line_omzet: number | null;
          nomor_bon: string | null;
          ongkir: number | null;
          owner_uid: string | null;
          product_id: string | null;
          product_name: string | null;
          product_type: string | null;
          qty: number | null;
          status: string | null;
          tahun: number | null;
          tanggal: string | null;
          transaction_id: string | null;
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
            foreignKeyName: "transactions_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      delete_transaction: {
        Args: { p_transaction_id: string };
        Returns: undefined;
      };
      save_customer: {
        Args: {
          p_bonus_threshold: number;
          p_br_steps: number[];
          p_customer_id: string | null;
          p_lm_steps: number[];
          p_nama: string;
        };
        Returns: string;
      };
      save_transaction: {
        Args: {
          p_bonus_units: number;
          p_customer_id: string;
          p_deskripsi: string | null;
          p_is_bonus: boolean;
          p_lines: Json;
          p_nomor_bon: string;
          p_ongkir: number;
          p_status: string;
          p_tanggal: string;
          p_tanggal_lunas: string | null;
          p_transaction_id: string | null;
        };
        Returns: string;
      };
      settle_month: {
        Args: {
          p_customer_id: string;
          p_month: number;
          p_tanggal_lunas?: string;
          p_year: number;
        };
        Returns: number;
      };
      settle_transaction: {
        Args: { p_tanggal_lunas?: string; p_transaction_id: string };
        Returns: boolean;
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
