<template>
  <PlaceholderTemplate
    title="Buat Bon"
    description="Form Bon akan menghitung diskon pelanggan dan omzet secara otomatis."
    eyebrow="Transaksi"
    empty-title="Form Bon sedang disiapkan"
    empty-description="Tahap berikutnya adalah product line editor, currency input, dan summary bar sticky."
  />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})
</script>
