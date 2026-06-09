<template>
  <PlaceholderTemplate
    title="Tambah Pelanggan"
    description="Form pelanggan akan memuat nama, threshold bonus, dan diskon bertingkat LM/BR."
    eyebrow="Pelanggan"
    empty-title="Form pelanggan sedang disiapkan"
    empty-description="Tahap berikutnya mengisi detail pelanggan, aturan diskon, dan bonus dengan alur yang mudah diikuti."
  />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})
</script>
