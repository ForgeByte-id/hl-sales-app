<template>
  <AppShell>
    <div v-if="transaction" class="space-y-5">
      <PageHeader :title="transaction.nomor_bon" :description="transaction.customers?.nama || 'Pelanggan'" eyebrow="Detail Bon">
        <template #actions>
          <AppButton to="/transactions" variant="secondary" icon="lucide:arrow-left">Kembali</AppButton>
          <AppButton :to="`/transactions/${transactionId}/edit`" variant="secondary" icon="lucide:pencil">Edit</AppButton>
          <AppButton v-if="transaction.status === 'piutang'" icon="lucide:check" @click="settle">Lunas</AppButton>
          <AppButton icon="lucide:printer" @click="exportDetail">PDF</AppButton>
        </template>
      </PageHeader>

      <DashboardSummaryGrid :items="summaryCards" />

      <SectionPanel title="Informasi Bon">
        <div class="grid gap-3 text-sm md:grid-cols-2">
          <p><span class="text-neutral-500">Tanggal:</span> {{ formatDate(transaction.tanggal) }}</p>
          <p><span class="text-neutral-500">Status:</span> <StatusBadge :status="transaction.is_bonus ? 'bonus' : transaction.status" /></p>
          <p><span class="text-neutral-500">Ongkir:</span> {{ formatRp(toNumber(transaction.ongkir)) }}</p>
          <p><span class="text-neutral-500">Tanggal Lunas:</span> {{ transaction.tanggal_lunas ? formatDate(transaction.tanggal_lunas) : '-' }}</p>
          <p class="md:col-span-2"><span class="text-neutral-500">Catatan:</span> {{ transaction.deskripsi || '-' }}</p>
        </div>
      </SectionPanel>

      <SectionPanel title="Produk">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
            <thead class="text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              <tr>
                <th class="px-3 py-2">Produk</th>
                <th class="px-3 py-2">Tipe</th>
                <th class="px-3 py-2 text-right">Qty</th>
                <th class="px-3 py-2 text-right">Harga</th>
                <th class="px-3 py-2 text-right">Omzet</th>
                <th class="px-3 py-2 text-right">Laba HL</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
              <tr v-for="line in transaction.transaction_lines" :key="line.id">
                <td class="px-3 py-3 font-medium">{{ line.products?.nama || '-' }}</td>
                <td class="px-3 py-3">{{ line.product_type }}</td>
                <td class="px-3 py-3 text-right">{{ line.qty }}</td>
                <td class="px-3 py-3 text-right">{{ formatRp(toNumber(line.discounted_price)) }}</td>
                <td class="px-3 py-3 text-right">{{ formatRp(toNumber(line.line_omzet)) }}</td>
                <td class="px-3 py-3 text-right">{{ formatRp(toNumber(line.line_laba_hl)) }}</td>
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
const route = useRoute()
const { exportHtml } = usePdfExport()
const transactionId = String(route.params.id)

const { data: transaction, refresh } = await useAsyncData(`transaction-detail-${transactionId}`, async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, customers(nama), transaction_lines(*, products(nama))')
    .eq('id', transactionId)
    .single()

  if (error) throw error
  return data
})

const omzet = computed(() => (transaction.value?.transaction_lines ?? []).reduce((total, line) => total + toNumber(line.line_omzet), 0))
const laba = computed(() => (transaction.value?.transaction_lines ?? []).reduce((total, line) => total + toNumber(line.line_laba_hl), 0))
const tagihan = computed(() => omzet.value + toNumber(transaction.value?.ongkir))
const summaryCards = computed(() => [
  { label: 'Omzet', value: formatRp(omzet.value), helper: 'Ongkir tidak dihitung', icon: 'lucide:chart-column' },
  { label: 'Ongkir', value: formatRp(toNumber(transaction.value?.ongkir)), helper: 'Biaya kirim', icon: 'lucide:truck' },
  { label: 'Tagihan', value: formatRp(tagihan.value), helper: 'Omzet + ongkir', icon: 'lucide:receipt-text' },
  { label: 'Laba HL', value: formatRp(laba.value), helper: 'Internal', icon: 'lucide:trending-up' },
])

async function settle() {
  await supabase.from('transactions').update({ status: 'lunas', tanggal_lunas: todayInputValue() }).eq('id', transactionId)
  await refresh()
}

function exportDetail() {
  const rows = (transaction.value?.transaction_lines ?? [])
    .map((line) => `<tr><td>${line.products?.nama || '-'}</td><td>${line.product_type}</td><td class="right">${line.qty}</td><td class="right">${formatRp(toNumber(line.discounted_price))}</td><td class="right">${formatRp(toNumber(line.line_omzet))}</td></tr>`)
    .join('')

  exportHtml(
    `HL - ${transaction.value?.nomor_bon || 'Bon'}`,
    `<h1>HL - ${transaction.value?.nomor_bon || 'Bon'}</h1><p>${transaction.value?.customers?.nama || ''}</p><table><thead><tr><th>Produk</th><th>Tipe</th><th class="right">Qty</th><th class="right">Harga</th><th class="right">Omzet</th></tr></thead><tbody>${rows}</tbody></table>`,
  )
}
</script>
