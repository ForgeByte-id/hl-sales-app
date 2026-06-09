<template>
  <AppBadge :tone="safeStatus">
    {{ label }}
  </AppBadge>
</template>

<script setup lang="ts">
type StatusBadgeValue = "piutang" | "lunas" | "bonus";

const props = defineProps<{
  status: string;
}>();

const safeStatus = computed<StatusBadgeValue>(() => {
  if (props.status === "lunas") return "lunas";
  if (props.status === "bonus") return "bonus";
  return "piutang";
});

const label = computed(() => {
  if (safeStatus.value === "piutang") return "Piutang";
  if (safeStatus.value === "lunas") return "Lunas";
  return "Bonus";
});
</script>
