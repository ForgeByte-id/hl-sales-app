<template>
  <section
    class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
  >
    <div class="flex gap-3">
      <Icon name="lucide:triangle-alert" class="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <h2 class="text-sm font-semibold">Data belum tersambung</h2>
        <p class="mt-1 text-sm leading-6">
          {{ message }}
        </p>
        <p class="mt-2 text-xs leading-5 text-amber-800 dark:text-amber-200">
          Hubungi pengelola aplikasi agar data usaha bisa tampil di dashboard.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>
