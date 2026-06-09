<template>
  <AppShell>
    <div class="space-y-5">
      <section class="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-neutral-800 dark:bg-neutral-900">
        <div class="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center lg:p-6">
          <div class="min-w-0">
            <div class="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-neutral-800 dark:text-brand-100">
              <Icon name="lucide:layout-dashboard" class="size-3.5" aria-hidden="true" />
              <span>Beranda</span>
            </div>
            <h1 class="mt-4 text-2xl font-semibold leading-8 text-neutral-950 dark:text-neutral-50">
              Dashboard
            </h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              Lihat piutang, omzet lunas, dan bonus yang perlu ditindaklanjuti dalam satu layar.
            </p>
          </div>
          <div class="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <AppButton to="/transactions/new" icon="lucide:plus">Buat Bon</AppButton>
            <AppButton to="/customers" icon="lucide:users" variant="secondary">Lihat Pelanggan</AppButton>
          </div>
        </div>
      </section>

      <SetupNotice v-if="setupMessage" :message="setupMessage" />

      <DashboardSummaryGrid v-if="!pending" :metrics="data.metrics" />
      <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Memuat ringkasan dashboard">
        <div v-for="index in 4" :key="index" class="h-32 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      </div>

      <section class="space-y-3">
        <div>
          <h2 class="text-base font-semibold leading-6 text-neutral-900 dark:text-neutral-100">Langkah Cepat</h2>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">Pilih pekerjaan yang paling sering dilakukan.</p>
        </div>
        <DashboardActionList :actions="actions" />
      </section>

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
