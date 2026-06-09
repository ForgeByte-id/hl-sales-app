<template>
  <AppShell>
    <div class="space-y-5">
      <PageHeader :title="`Rekap ${type}`" description="Ringkasan berdasarkan tipe produk." eyebrow="Laporan">
        <template #actions>
          <AppButton to="/recap" variant="secondary" icon="lucide:arrow-left">Kembali</AppButton>
          <AppButton icon="lucide:printer" @click="exportReport">PDF</AppButton>
        </template>
      </PageHeader>

      <SectionPanel title="Periode">
        <AppTextInput v-model="period" label="Bulan" type="month" />
      </SectionPanel>

      <DashboardSummaryGrid :items="summaryCards" />
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import type { Database } from '~~/types/database.types'

definePageMeta({ middleware: ['auth'] })

const supabase = useSupabaseClient<Database>()
const route = useRoute()
const { exportHtml } = usePdfExport()
const type = computed(() => String(route.params.type).toUpperCase() === 'BR' ? 'BR' : 'LM')
const period = ref(currentMonthValue())

const { data: transactions } = await useAsyncData(`recap-type-${type.value}`, async () => {
  const { data, error } = await supabase.from('transactions').select('*, transaction_lines(*)').order('tanggal', { ascending: false })
  if (error) throw error
  return data ?? []
})

const filteredLines = computed(() => {
  const { year, month } = splitMonthValue(period.value)
  return (transactions.value ?? [])
    .filter((transaction) => {
      const date = new Date(transaction.tanggal)
      return date.getFullYear() === year && date.getMonth() + 1 === month && !transaction.is_bonus
    })
    .flatMap((transaction) =>
      (transaction.transaction_lines ?? [])
        .filter((line) => line.product_type === type.value)
        .map((line) => ({ ...line, status: transaction.status, ongkir: transaction.ongkir })),
    )
})

const summary = computed(() => {
  const paid = filteredLines.value.filter((line) => line.status === 'lunas')
  const receivable = filteredLines.value.filter((line) => line.status === 'piutang')

  return {
    omzet: paid.reduce((total, line) => total + toNumber(line.line_omzet), 0),
    laba: paid.reduce((total, line) => total + toNumber(line.line_laba_hl), 0),
    piutang: receivable.reduce((total, line) => total + toNumber(line.line_omzet), 0),
    paid: paid.reduce((total, line) => total + toNumber(line.line_omzet), 0),
  }
})

const summaryCards = computed(() => [
  { label: 'Omzet Lunas', value: formatRp(summary.value.omzet), helper: type.value, icon: 'lucide:chart-column' },
  { label: 'Laba HL', value: formatRp(summary.value.laba), helper: 'Internal', icon: 'lucide:trending-up' },
  { label: 'Piutang', value: formatRp(summary.value.piutang), helper: 'Belum lunas', icon: 'lucide:wallet' },
  { label: 'Sudah Dibayar', value: formatRp(summary.value.paid), helper: 'Omzet produk', icon: 'lucide:badge-check' },
])

function exportReport() {
  exportHtml(
    `HL - Rekap ${type.value}`,
    `<h1>HL - Rekap ${type.value}</h1><p>Periode ${period.value}</p><table><tbody><tr><th>Omzet Lunas</th><td class="right">${formatRp(summary.value.omzet)}</td></tr><tr><th>Laba HL</th><td class="right">${formatRp(summary.value.laba)}</td></tr><tr><th>Piutang</th><td class="right">${formatRp(summary.value.piutang)}</td></tr><tr><th>Sudah Dibayar</th><td class="right">${formatRp(summary.value.paid)}</td></tr></tbody></table>`,
  )
}
</script>
