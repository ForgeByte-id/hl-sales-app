<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <SummaryCard
      v-for="metric in metrics"
      :key="metric.label"
      :label="metric.label"
      :value="metric.value"
      :helper="metric.helper"
      :icon="metric.icon"
    />
  </div>
</template>

<script setup lang="ts">
import type { DashboardMetric } from '~/types/dashboard'

defineProps<{
  metrics: DashboardMetric[]
}>()
</script>
