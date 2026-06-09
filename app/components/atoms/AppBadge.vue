<template>
  <span :class="classes">
    <span :class="dotClasses" aria-hidden="true" />
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tone?: 'neutral' | 'piutang' | 'lunas' | 'bonus'
  }>(),
  {
    tone: 'neutral',
  },
)

const toneClasses = {
  neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200',
  piutang: 'bg-piutang-bg text-piutang-text dark:bg-piutang-dark-bg dark:text-piutang-dark-text',
  lunas: 'bg-lunas-bg text-lunas-text dark:bg-lunas-dark-bg dark:text-lunas-dark-text',
  bonus: 'bg-bonus-bg text-bonus-text dark:bg-bonus-dark-bg dark:text-bonus-dark-text',
}

const dotToneClasses = {
  neutral: 'bg-neutral-400',
  piutang: 'bg-piutang-dot dark:bg-piutang-dark-dot',
  lunas: 'bg-lunas-dot dark:bg-lunas-dark-dot',
  bonus: 'bg-bonus-dot dark:bg-bonus-dark-dot',
}

const classes = computed(() => [
  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
  toneClasses[props.tone],
])
const dotClasses = computed(() => ['size-1.5 rounded-full', dotToneClasses[props.tone]])
</script>
