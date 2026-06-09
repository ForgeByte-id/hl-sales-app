<template>
  <div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
    <NuxtLink
      v-for="action in actions"
      :key="action.to"
      :to="action.to"
      class="group rounded-xl border border-neutral-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50/70 hover:shadow-[0_14px_40px_rgba(14,165,233,0.14)] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-700 dark:hover:bg-neutral-800"
    >
      <div class="flex items-start gap-3">
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-md"
          :class="action.primary ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-200'"
        >
          <Icon :name="action.icon" class="size-5" aria-hidden="true" />
        </span>
        <span class="min-w-0">
          <span class="block text-sm font-semibold text-neutral-900 dark:text-neutral-50">{{ action.label }}</span>
          <span class="mt-1 block text-sm text-neutral-500 dark:text-neutral-400">{{ action.description }}</span>
        </span>
        <Icon name="lucide:arrow-right" class="ml-auto mt-1 size-4 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600 dark:text-neutral-600 dark:group-hover:text-brand-300" aria-hidden="true" />
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { DashboardAction } from '~/types/dashboard'

defineProps<{
  actions: DashboardAction[]
}>()
</script>
