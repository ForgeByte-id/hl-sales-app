<template>
  <AppShell>
    <div class="space-y-5">
      <PageHeader title="Pelanggan" description="Kelola pelanggan, diskon, piutang, dan bonus." eyebrow="Master Data">
        <template #actions>
          <AppButton to="/customers/new" icon="lucide:user-plus">Tambah Pelanggan</AppButton>
        </template>
      </PageHeader>

      <SectionPanel title="Daftar Pelanggan" description="Pelanggan aktif untuk pembuatan Bon.">
        <div class="mb-4 max-w-sm">
          <AppTextInput v-model="search" label="Cari" placeholder="Nama pelanggan" icon="lucide:search" />
        </div>

        <div v-if="pending" class="text-sm text-neutral-500 dark:text-neutral-400">Memuat data...</div>
        <EmptyState
          v-else-if="filteredCustomers.length === 0"
          title="Belum ada pelanggan"
          description="Tambahkan pelanggan pertama untuk mulai membuat Bon."
          icon="lucide:users"
        />
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
            <thead class="text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              <tr>
                <th class="px-3 py-2">Nama</th>
                <th class="px-3 py-2">Threshold Bonus</th>
                <th class="px-3 py-2">Piutang</th>
                <th class="px-3 py-2">Bonus</th>
                <th class="px-3 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
              <tr v-for="customer in filteredCustomers" :key="customer.id">
                <td class="px-3 py-3 font-medium text-neutral-900 dark:text-neutral-50">{{ customer.nama }}</td>
                <td class="px-3 py-3 text-neutral-600 dark:text-neutral-300">{{ formatRp(toNumber(customer.bonus_threshold)) }}</td>
                <td class="px-3 py-3 text-neutral-600 dark:text-neutral-300">{{ formatRp(receivableByCustomer.get(customer.id) ?? 0) }}</td>
                <td class="px-3 py-3">
                  <AppBadge v-if="bonusByCustomer.get(customer.id)" tone="bonus">
                    {{ bonusByCustomer.get(customer.id) }} tersedia
                  </AppBadge>
                  <span v-else class="text-neutral-400">-</span>
                </td>
                <td class="px-3 py-3">
                  <div class="flex justify-end gap-2">
                    <AppButton :to="`/customers/${customer.id}`" variant="secondary" size="sm" icon="lucide:eye">Detail</AppButton>
                    <AppButton :to="`/customers/${customer.id}/edit`" variant="ghost" size="sm" icon="lucide:pencil">Edit</AppButton>
                    <AppButton variant="danger" size="sm" icon="lucide:archive" @click="archiveCustomer(customer.id)">Arsip</AppButton>
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

const { data, pending, refresh } = await useAsyncData('customers-index', async () => {
  const [customersResult, transactionsResult] = await Promise.all([
    supabase.from('customers').select('*').is('deleted_at', null).order('nama'),
    supabase
      .from('transactions')
      .select('id, customer_id, ongkir, status, is_bonus, transaction_lines(line_omzet)')
      .order('tanggal', { ascending: false }),
  ])

  if (customersResult.error) throw customersResult.error
  if (transactionsResult.error) throw transactionsResult.error

  return {
    customers: customersResult.data ?? [],
    transactions: transactionsResult.data ?? [],
  }
})

const customers = computed(() => data.value?.customers ?? [])
const filteredCustomers = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return customers.value

  return customers.value.filter((customer) => customer.nama.toLowerCase().includes(keyword))
})

const receivableByCustomer = computed(() => {
  const map = new Map<string, number>()

  for (const transaction of data.value?.transactions ?? []) {
    if (transaction.status !== 'piutang' || transaction.is_bonus) continue
    const omzet = (transaction.transaction_lines ?? []).reduce((total, line) => total + toNumber(line.line_omzet), 0)
    map.set(transaction.customer_id, (map.get(transaction.customer_id) ?? 0) + omzet + toNumber(transaction.ongkir))
  }

  return map
})

const bonusByCustomer = computed(() => {
  const paid = new Map<string, number>()
  const bonus = new Map<string, number>()

  for (const transaction of data.value?.transactions ?? []) {
    if (transaction.status !== 'lunas' || transaction.is_bonus) continue
    const omzet = (transaction.transaction_lines ?? []).reduce((total, line) => total + toNumber(line.line_omzet), 0)
    paid.set(transaction.customer_id, (paid.get(transaction.customer_id) ?? 0) + omzet)
  }

  for (const customer of customers.value) {
    const available = calcBonusesAvailable(
      paid.get(customer.id) ?? 0,
      toNumber(customer.bonus_threshold),
      toNumber(customer.bonuses_granted),
    )
    if (available > 0) bonus.set(customer.id, available)
  }

  return bonus
})

async function archiveCustomer(id: string) {
  if (!window.confirm('Arsipkan pelanggan ini? Riwayat transaksi tetap tersimpan.')) return

  await supabase.from('customers').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  await refresh()
}
</script>
