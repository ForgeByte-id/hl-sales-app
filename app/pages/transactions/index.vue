<template>
  <AppShell>
    <div class="space-y-5">
      <PageHeader title="Transaksi" description="Daftar Bon dan status pembayaran." eyebrow="Bon">
        <template #actions>
          <AppButton to="/transactions/new" icon="lucide:plus">Buat Bon</AppButton>
        </template>
      </PageHeader>

      <SectionPanel title="Daftar Bon">
        <div class="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
          <AppTextInput v-model="search" label="Cari" placeholder="Nomor Bon atau pelanggan" icon="lucide:search" />
          <label class="block">
            <span class="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Status</span>
            <select v-model="statusFilter" class="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
              <option value="">Semua</option>
              <option value="piutang">Piutang</option>
              <option value="lunas">Lunas</option>
            </select>
          </label>
        </div>

        <EmptyState v-if="filteredTransactions.length === 0" title="Belum ada Bon" description="Buat Bon pertama untuk mulai mencatat penjualan." icon="lucide:receipt-text" />
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
            <thead class="text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              <tr>
                <th class="px-3 py-2">Tanggal</th>
                <th class="px-3 py-2">Nomor Bon</th>
                <th class="px-3 py-2">Pelanggan</th>
                <th class="px-3 py-2">Status</th>
                <th class="px-3 py-2 text-right">Tagihan</th>
                <th class="px-3 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
              <tr v-for="transaction in filteredTransactions" :key="transaction.id">
                <td class="px-3 py-3 text-neutral-600 dark:text-neutral-300">{{ formatDate(transaction.tanggal) }}</td>
                <td class="px-3 py-3 font-medium text-neutral-900 dark:text-neutral-50">{{ transaction.nomor_bon }}</td>
                <td class="px-3 py-3 text-neutral-600 dark:text-neutral-300">{{ transaction.customers?.nama || '-' }}</td>
                <td class="px-3 py-3"><StatusBadge :status="transaction.is_bonus ? 'bonus' : transaction.status" /></td>
                <td class="px-3 py-3 text-right">{{ formatRp(amount(transaction)) }}</td>
                <td class="px-3 py-3">
                  <div class="flex justify-end gap-2">
                    <AppButton :to="`/transactions/${transaction.id}`" variant="secondary" size="sm" icon="lucide:eye">Detail</AppButton>
                    <AppButton :to="`/transactions/${transaction.id}/edit`" variant="ghost" size="sm" icon="lucide:pencil">Edit</AppButton>
                    <AppButton variant="danger" size="sm" icon="lucide:trash" @click="deleteTransaction(transaction.id)">Hapus</AppButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionPanel>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import type { Database } from '~~/types/database.types'

definePageMeta({ middleware: ['auth'] })

const supabase = useSupabaseClient<Database>()
const search = ref('')
const statusFilter = ref('')

const { data: transactions, refresh } = await useAsyncData('transactions-index', async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, customers(nama), transaction_lines(line_omzet)')
    .order('tanggal', { ascending: false })

  if (error) throw error
  return data ?? []
})

function amount(transaction: { ongkir: number | string; transaction_lines?: Array<{ line_omzet: number | string }> }) {
  return (transaction.transaction_lines ?? []).reduce((total, line) => total + toNumber(line.line_omzet), 0) + toNumber(transaction.ongkir)
}

const filteredTransactions = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return (transactions.value ?? []).filter((transaction) => {
    const haystack = `${transaction.nomor_bon} ${transaction.customers?.nama || ''}`.toLowerCase()
    const matchesKeyword = !keyword || haystack.includes(keyword)
    const matchesStatus = !statusFilter.value || transaction.status === statusFilter.value
    return matchesKeyword && matchesStatus
  })
})

async function deleteTransaction(id: string) {
  if (!window.confirm('Hapus Bon ini? Data tidak bisa dikembalikan dari layar ini.')) return

  await supabase.from('transactions').delete().eq('id', id)
  await refresh()
}
</script>
