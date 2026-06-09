<template>
  <SectionPanel :title="title" :description="description">
    <div v-if="items.length" class="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
      <ul class="divide-y divide-neutral-200 dark:divide-neutral-800">
        <li
          v-for="item in items"
          :key="item.id"
          class="grid grid-cols-1 gap-2 bg-white px-3 py-3 hover:bg-brand-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 sm:grid-cols-[1fr_auto] sm:items-center"
        >
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <p class="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-50">{{ item.title }}</p>
              <StatusBadge :status="item.status" />
            </div>
            <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{{ item.meta }}</p>
          </div>
          <p class="font-mono text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">
            {{ item.amount }}
          </p>
        </li>
      </ul>
    </div>
    <EmptyState
      v-else
      :title="emptyTitle"
      :description="emptyDescription"
      icon="lucide:inbox"
    />
  </SectionPanel>
</template>

<script setup lang="ts">
import type { DashboardListItem } from '~/types/dashboard'

defineProps<{
  title: string
  description: string
  items: DashboardListItem[]
  emptyTitle: string
  emptyDescription: string
}>()
</script>
