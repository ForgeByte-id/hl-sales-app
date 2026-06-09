<template>
  <AppBadge :tone="status">
    {{ label }}
  </AppBadge>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: 'piutang' | 'lunas' | 'bonus'
}>()

const label = computed(() => {
  if (props.status === 'piutang') return 'Piutang'
  if (props.status === 'lunas') return 'Lunas'
  return 'Bonus'
})
</script>
