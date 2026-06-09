<template>
  <PlaceholderTemplate
    title="Tambah Produk"
    description="Form produk akan memuat nama, tipe LM/BR, harga base, dan harga modal internal."
    eyebrow="Produk"
    empty-title="Form produk sedang disiapkan"
    empty-description="Harga modal akan disimpan untuk perhitungan laba dan tidak ditampilkan di output pelanggan."
  />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})
</script>
