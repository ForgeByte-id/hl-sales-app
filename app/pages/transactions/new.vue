<template>
  <AppShell>
    <TransactionForm
      title="Buat Bon"
      submit-label="Simpan Bon"
      :customers="customers"
      :products="products"
      :discount-steps="discountSteps"
      @submit="createTransaction"
    />
  </AppShell>
</template>

<script setup lang="ts">
import type { Database } from '~~/types/database.types'

definePageMeta({ middleware: ['auth'] })

const supabase = useSupabaseClient<Database>()
const router = useRouter()

const { data } = await useAsyncData('transaction-form-master', async () => {
  const [customersResult, productsResult, stepsResult] = await Promise.all([
    supabase.from('customers').select('*').is('deleted_at', null).order('nama'),
    supabase.from('products').select('*').is('deleted_at', null).order('nama'),
    supabase.from('discount_steps').select('*').order('step_order'),
  ])

  if (customersResult.error) throw customersResult.error
  if (productsResult.error) throw productsResult.error
  if (stepsResult.error) throw stepsResult.error

  return {
    customers: customersResult.data ?? [],
    products: productsResult.data ?? [],
    discountSteps: stepsResult.data ?? [],
  }
})

const customers = computed(() => data.value?.customers ?? [])
const products = computed(() => data.value?.products ?? [])
const discountSteps = computed(() => data.value?.discountSteps ?? [])

async function createTransaction(payload: {
  transaction: Database['public']['Tables']['transactions']['Insert']
  lines: Array<Omit<Database['public']['Tables']['transaction_lines']['Insert'], 'transaction_id'>>
}) {
  const { data: transaction, error } = await supabase.from('transactions').insert(payload.transaction).select('id').single()
  if (error || !transaction) {
    window.alert(error?.message || 'Bon belum bisa disimpan.')
    return
  }

  const { error: linesError } = await supabase.from('transaction_lines').insert(
    payload.lines.map((line) => ({
      ...line,
      transaction_id: transaction.id,
    })),
  )

  if (linesError) {
    window.alert(linesError.message)
    return
  }

  await router.push(`/transactions/${transaction.id}`)
}
</script>
