<template>
  <div
    class="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center dark:border-neutral-800 dark:bg-neutral-900"
    role="status"
  >
    <div class="flex size-10 items-center justify-center rounded-md bg-white text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
      <Icon :name="icon" class="size-5" aria-hidden="true" />
    </div>
    <h3 class="mt-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
      {{ title }}
    </h3>
    <p class="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
      {{ description }}
    </p>
    <AppButton v-if="actionLabel && actionTo" :to="actionTo" icon="lucide:plus" class="mt-4" size="sm">
      {{ actionLabel }}
    </AppButton>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description: string
    icon?: string
    actionLabel?: string
    actionTo?: string
  }>(),
  {
    icon: 'lucide:inbox',
    actionLabel: '',
    actionTo: '',
  },
)
</script>
