<template>
  <div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
    <NuxtLink
      v-for="action in actions"
      :key="action.to"
      :to="action.to"
      class="group rounded-lg border border-neutral-200 bg-white p-4 shadow-soft transition hover:border-brand-500 hover:bg-brand-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-500 dark:hover:bg-neutral-800"
    >
      <div class="flex items-start gap-3">
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-md"
          :class="action.primary ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-200'"
        >
          <Icon :name="action.icon" class="size-5" aria-hidden="true" />
        </span>
        <span>
          <span class="block text-sm font-semibold text-neutral-900 dark:text-neutral-50">{{ action.label }}</span>
          <span class="mt-1 block text-sm text-neutral-500 dark:text-neutral-400">{{ action.description }}</span>
        </span>
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
