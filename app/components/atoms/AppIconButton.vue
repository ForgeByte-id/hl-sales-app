<template>
  <button
    :type="type"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    class="inline-flex size-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
  >
    <Icon :name="icon" class="size-4" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string
    label: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    type: 'button',
    disabled: false,
  },
)
</script>
