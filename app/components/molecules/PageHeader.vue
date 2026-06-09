<template>
  <header class="flex flex-col gap-3 border-b border-neutral-200 pb-5 dark:border-neutral-800 md:flex-row md:items-start md:justify-between">
    <div>
      <p v-if="eyebrow" class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {{ eyebrow }}
      </p>
      <h1 class="mt-1 text-xl font-semibold leading-7 text-neutral-900 dark:text-neutral-50">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-1 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-col gap-2 sm:flex-row md:justify-end">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    eyebrow?: string
  }>(),
  {
    description: '',
    eyebrow: '',
  },
)
</script>
