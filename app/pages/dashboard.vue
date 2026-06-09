<template>
  <DashboardTemplate
    :data="dashboard"
    :pending="pending"
    :setup-message="dashboard.setupMessage || errorMessage"
  />
</template>

<script setup lang="ts">
import type { DashboardData } from '~/types/dashboard'

definePageMeta({
  middleware: ['auth'],
})

const { data, pending, error } = await useDashboardData()

const dashboard = computed<DashboardData>(() => data.value ?? {
  isConfigured: false,
  metrics: [],
  urgentReceivables: [],
  bonusCustomers: [],
  setupMessage: 'Dashboard belum bisa dimuat.',
})

const errorMessage = computed(() => error.value?.message ?? null)
</script>
