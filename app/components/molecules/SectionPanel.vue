<template>
  <section class="rounded-lg border border-neutral-200 bg-white shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
    <div class="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
      <div>
        <h2 class="text-base font-semibold leading-6 text-neutral-900 dark:text-neutral-100">
          {{ title }}
        </h2>
        <p v-if="description" class="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
          {{ description }}
        </p>
      </div>
      <slot name="action" />
    </div>
    <div class="p-4">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
  }>(),
  {
    description: '',
  },
)
</script>
