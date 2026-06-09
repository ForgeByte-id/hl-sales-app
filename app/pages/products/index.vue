<template>
  <PlaceholderTemplate
    title="Produk"
    description="Kelola produk LM dan BR dengan harga base serta harga modal internal."
    eyebrow="Master Data"
    empty-title="Data produk belum dibuat"
    empty-description="Produk aktif akan muncul di form Bon. Produk yang sudah dipakai transaksi akan diarsipkan, bukan dihapus permanen."
    action-label="Tambah Produk"
    action-to="/products/new"
    action-icon="lucide:package-plus"
  />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})
</script>
