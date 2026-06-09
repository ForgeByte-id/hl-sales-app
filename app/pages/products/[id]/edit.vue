<template>
  <AppShell>
    <ProductForm
      v-if="product"
      title="Edit Produk"
      submit-label="Simpan"
      :initial="product"
      @submit="updateProduct"
    />
  </AppShell>
</template>

<script setup lang="ts">
import type { Database } from '~~/types/database.types'

definePageMeta({ middleware: ['auth'] })

const supabase = useSupabaseClient<Database>()
const route = useRoute()
const router = useRouter()
const productId = String(route.params.id)

const { data: product } = await useAsyncData(`product-edit-${productId}`, async () => {
  const { data, error } = await supabase.from('products').select('*').eq('id', productId).single()
  if (error) throw error
  return data
})

async function updateProduct(payload: { nama: string; tipe: 'LM' | 'BR'; harga_modal: number; harga_base: number }) {
  const { error } = await supabase.from('products').update(payload).eq('id', productId)
  if (error) throw error
  await router.push('/products')
}
</script>
