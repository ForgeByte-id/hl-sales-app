<template>
  <NuxtLink v-if="to" :to="to" :class="classes">
    <Icon v-if="icon" :name="icon" class="size-4" aria-hidden="true" />
    <span><slot /></span>
  </NuxtLink>
  <button v-else :type="type" :disabled="disabled" :class="classes">
    <Icon v-if="icon" :name="icon" class="size-4" aria-hidden="true" />
    <span><slot /></span>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    to?: string
    icon?: string
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    disabled?: boolean
  }>(),
  {
    type: 'button',
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
)

const variantClasses = {
  primary:
    'border-brand-600 bg-brand-600 text-white hover:bg-brand-700 hover:border-brand-700 disabled:bg-brand-300 disabled:border-brand-300',
  secondary:
    'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800',
  ghost:
    'border-transparent bg-transparent text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
  danger:
    'border-danger bg-danger text-white hover:bg-red-600 hover:border-red-600 disabled:bg-red-300 disabled:border-red-300',
}

const sizeClasses = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
}

const classes = computed(() => [
  'inline-flex items-center justify-center gap-2 rounded-md border font-medium shadow-soft transition disabled:cursor-not-allowed disabled:opacity-70',
  variantClasses[props.variant],
  sizeClasses[props.size],
])
</script>
