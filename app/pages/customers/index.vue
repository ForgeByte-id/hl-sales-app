<template>
  <PlaceholderTemplate
    title="Pelanggan"
    description="Kelola data pelanggan, diskon LM/BR, dan threshold bonus."
    eyebrow="Master Data"
    empty-title="Data pelanggan belum dibuat"
    empty-description="Mulai dengan menambahkan pelanggan pertama. Diskon dan bonus bisa diatur dari form pelanggan."
    action-label="Tambah Pelanggan"
    action-to="/customers/new"
    action-icon="lucide:user-plus"
  />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})
</script>
