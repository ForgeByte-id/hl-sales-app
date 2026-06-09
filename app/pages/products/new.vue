<template>
  <AppShell>
    <ProductForm title="Tambah Produk" submit-label="Simpan" @submit="createProduct" />
  </AppShell>
</template>

<script setup lang="ts">
import type { Database } from '~~/types/database.types'

definePageMeta({ middleware: ['auth'] })

const supabase = useSupabaseClient<Database>()
const router = useRouter()

async function createProduct(payload: { nama: string; tipe: 'LM' | 'BR'; harga_modal: number; harga_base: number }) {
  const { error } = await supabase.from('products').insert(payload)
  if (error) throw error
  await router.push('/products')
}
</script>
