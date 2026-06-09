<template>
  <section class="group rounded-xl border border-neutral-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-[0_16px_48px_rgba(15,23,42,0.10)] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {{ label }}
        </p>
        <p class="mt-3 text-2xl font-bold leading-8 tabular-nums text-neutral-900 dark:text-neutral-50">
          {{ value }}
        </p>
      </div>
      <div class="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-neutral-800 dark:text-brand-100 dark:ring-neutral-700">
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
