<template>
  <PlaceholderTemplate
    title="Tambah Pelanggan"
    description="Form pelanggan akan memuat nama, threshold bonus, dan diskon bertingkat LM/BR."
    eyebrow="Pelanggan"
    empty-title="Form pelanggan sedang disiapkan"
    empty-description="Fondasi UI dan koneksi Supabase sudah tersedia. Tahap berikutnya mengisi form CRUD pelanggan."
  />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})
</script>
