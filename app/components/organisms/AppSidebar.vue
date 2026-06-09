<template>
  <aside
    class="flex h-full flex-col border-r border-neutral-200 bg-white px-3 py-4 dark:border-neutral-800 dark:bg-neutral-950"
  >
    <NuxtLink to="/dashboard" class="flex items-center gap-2 rounded-md px-2 py-2">
      <span class="flex size-9 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
        HL
      </span>
      <span class="min-w-0">
        <span class="block text-sm font-semibold leading-5 text-neutral-900 dark:text-neutral-50">HL App</span>
        <span class="block text-xs leading-4 text-neutral-500 dark:text-neutral-400">Bon & Piutang</span>
      </span>
    </NuxtLink>

    <nav class="mt-6 space-y-1" aria-label="Navigasi utama">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
        active-class="bg-brand-100 text-brand-700 dark:bg-neutral-800 dark:text-brand-100"
      >
        <Icon :name="item.icon" class="size-4" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="mt-auto border-t border-neutral-200 pt-3 dark:border-neutral-800">
      <button
        class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
        type="button"
        @click="$emit('logout')"
      >
        <Icon name="lucide:log-out" class="size-4" aria-hidden="true" />
        <span>Keluar</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineEmits<{
  logout: []
}>()

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: 'lucide:layout-dashboard' },
  { label: 'Pelanggan', to: '/customers', icon: 'lucide:users' },
  { label: 'Produk', to: '/products', icon: 'lucide:package' },
  { label: 'Transaksi', to: '/transactions', icon: 'lucide:receipt-text' },
  { label: 'Rekap', to: '/recap', icon: 'lucide:chart-column' },
]
</script>
