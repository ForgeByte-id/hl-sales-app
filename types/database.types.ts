export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          owner_uid: string
          nama: string
          bonus_threshold: number
          bonuses_granted: number
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_uid?: string
          nama: string
          bonus_threshold?: number
          bonuses_granted?: number
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_uid?: string
          nama?: string
          bonus_threshold?: number
          bonuses_granted?: number
          deleted_at?: string | null
          created_at?: string
        }
      }
      discount_steps: {
        Row: {
          id: string
          owner_uid: string
          customer_id: string
          product_type: 'LM' | 'BR'
          step_order: number
          percentage: number
        }
        Insert: {
          id?: string
          owner_uid?: string
          customer_id: string
          product_type: 'LM' | 'BR'
          step_order: number
          percentage: number
        }
        Update: {
          id?: string
          owner_uid?: string
          customer_id?: string
          product_type?: 'LM' | 'BR'
          step_order?: number
          percentage?: number
        }
      }
      products: {
        Row: {
          id: string
          owner_uid: string
          nama: string
          harga_modal: number
          harga_base: number
          tipe: 'LM' | 'BR'
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_uid?: string
          nama: string
          harga_modal: number
          harga_base: number
          tipe: 'LM' | 'BR'
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_uid?: string
          nama?: string
          harga_modal?: number
          harga_base?: number
          tipe?: 'LM' | 'BR'
          deleted_at?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          owner_uid: string
          nomor_bon: string
          tanggal: string
          customer_id: string
          ongkir: number
          deskripsi: string | null
          is_bonus: boolean
          status: 'piutang' | 'lunas'
          tanggal_lunas: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_uid?: string
          nomor_bon: string
          tanggal?: string
          customer_id: string
          ongkir?: number
          deskripsi?: string | null
          is_bonus?: boolean
          status?: 'piutang' | 'lunas'
          tanggal_lunas?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_uid?: string
          nomor_bon?: string
          tanggal?: string
          customer_id?: string
          ongkir?: number
          deskripsi?: string | null
          is_bonus?: boolean
          status?: 'piutang' | 'lunas'
          tanggal_lunas?: string | null
          created_at?: string
        }
      }
      transaction_lines: {
        Row: {
          id: string
          owner_uid: string
          transaction_id: string
          product_id: string
          product_type: 'LM' | 'BR'
          harga_modal_snap: number
          harga_base_snap: number
          discounted_price: number
          qty: number
          line_omzet: number
          line_laba_hl: number
        }
        Insert: {
          id?: string
          owner_uid?: string
          transaction_id: string
          product_id: string
          product_type: 'LM' | 'BR'
          harga_modal_snap: number
          harga_base_snap: number
          discounted_price: number
          qty: number
          line_omzet: number
          line_laba_hl: number
        }
        Update: {
          id?: string
          owner_uid?: string
          transaction_id?: string
          product_id?: string
          product_type?: 'LM' | 'BR'
          harga_modal_snap?: number
          harga_base_snap?: number
          discounted_price?: number
          qty?: number
          line_omzet?: number
          line_laba_hl?: number
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      settle_month: {
        Args: {
          p_customer_id: string
          p_year: number
          p_month: number
          p_tanggal_lunas: string
        }
        Returns: number
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
