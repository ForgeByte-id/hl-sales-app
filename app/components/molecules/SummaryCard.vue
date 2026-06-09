<template>
  <section class="rounded-lg border border-neutral-200 bg-white p-4 shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {{ label }}
        </p>
        <p class="mt-3 text-2xl font-bold leading-8 tabular-nums text-neutral-900 dark:text-neutral-50">
          {{ value }}
        </p>
      </div>
      <div class="flex size-9 items-center justify-center rounded-md bg-brand-50 text-brand-700 dark:bg-neutral-800 dark:text-brand-100">
        <Icon :name="icon" class="size-5" aria-hidden="true" />
      </div>
    </div>
    <p class="mt-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
      {{ helper }}
    </p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string
  helper: string
  icon: string
}>()
</script>
