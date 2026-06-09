<template>
  <AppShell>
    <div class="space-y-5">
      <PageHeader :title="title" :description="description" :eyebrow="eyebrow">
        <template v-if="actionLabel && actionTo" #actions>
          <AppButton :to="actionTo" :icon="actionIcon">{{ actionLabel }}</AppButton>
        </template>
      </PageHeader>

      <EmptyState
        :title="emptyTitle"
        :description="emptyDescription"
        icon="lucide:clipboard-list"
      />
    </div>
  </AppShell>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description: string
    eyebrow: string
    emptyTitle: string
    emptyDescription: string
    actionLabel?: string
    actionTo?: string
    actionIcon?: string
  }>(),
  {
    actionLabel: '',
    actionTo: '',
    actionIcon: 'lucide:plus',
  },
)
</script>
