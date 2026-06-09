<template>
  <AppShell>
    <div class="space-y-5">
      <PageHeader title="Rekap" description="Pilih jenis rekap yang ingin dilihat." eyebrow="Laporan" />

      <div class="grid gap-4 md:grid-cols-3">
        <NuxtLink
          v-for="item in recapLinks"
          :key="item.to"
          :to="item.to"
          class="rounded-lg border border-neutral-200 bg-white p-4 shadow-soft transition hover:border-brand-300 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <Icon :name="item.icon" class="size-5 text-brand-600" aria-hidden="true" />
          <h2 class="mt-3 text-base font-semibold text-neutral-900 dark:text-neutral-50">{{ item.title }}</h2>
          <p class="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{{ item.description }}</p>
        </NuxtLink>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const recapLinks = [
  { title: 'Rekap Keseluruhan', description: 'Omzet, laba, piutang, dan pembayaran semua pelanggan.', to: '/recap/overall', icon: 'lucide:chart-column' },
  { title: 'Rekap LM', description: 'Ringkasan transaksi untuk produk tipe LM.', to: '/recap/type/LM', icon: 'lucide:badge' },
  { title: 'Rekap BR', description: 'Ringkasan transaksi untuk produk tipe BR.', to: '/recap/type/BR', icon: 'lucide:badge' },
]
</script>
