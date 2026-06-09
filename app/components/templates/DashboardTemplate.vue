<template>
  <AppShell>
    <div class="space-y-5">
      <PageHeader
        title="Dashboard"
        description="Ringkasan harian untuk melihat piutang, omzet lunas, dan bonus yang perlu ditindaklanjuti."
        eyebrow="Beranda"
      >
        <template #actions>
          <AppButton to="/transactions/new" icon="lucide:plus">Buat Bon</AppButton>
          <AppButton to="/customers" icon="lucide:users" variant="secondary">Lihat Pelanggan</AppButton>
        </template>
      </PageHeader>

      <SetupNotice v-if="setupMessage" :message="setupMessage" />

      <DashboardSummaryGrid v-if="!pending" :metrics="data.metrics" />
      <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Memuat ringkasan dashboard">
        <div v-for="index in 4" :key="index" class="h-32 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      </div>

      <DashboardActionList :actions="actions" />

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardList
          title="Piutang Terbaru"
          description="Bon yang belum lunas dan perlu dicek."
          :items="data.urgentReceivables"
          empty-title="Belum ada piutang"
          empty-description="Semua bon yang tercatat sudah lunas atau belum ada transaksi."
        />
        <DashboardList
          title="Bonus Belum Diambil"
          description="Pelanggan yang sudah memenuhi syarat bonus."
          :items="data.bonusCustomers"
          empty-title="Belum ada bonus tersedia"
          empty-description="Bonus akan muncul otomatis saat omzet lunas melewati threshold pelanggan."
        />
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import type { DashboardAction, DashboardData } from '~/types/dashboard'

const props = defineProps<{
  data: DashboardData
  pending: boolean
  setupMessage: string | null
}>()

const actions: DashboardAction[] = [
  {
    label: 'Buat Bon Baru',
    description: 'Catat transaksi penjualan dengan diskon otomatis.',
    icon: 'lucide:plus',
    to: '/transactions/new',
    primary: true,
  },
  {
    label: 'Tambah Pelanggan',
    description: 'Simpan nama, diskon LM/BR, dan threshold bonus.',
    icon: 'lucide:user-plus',
    to: '/customers/new',
  },
  {
    label: 'Lihat Rekap',
    description: 'Cek omzet, laba, piutang, dan pembayaran.',
    icon: 'lucide:chart-column',
    to: '/recap',
  },
]

void props
</script>
