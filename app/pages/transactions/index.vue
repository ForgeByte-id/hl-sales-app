<template>
  <PlaceholderTemplate
    title="Transaksi"
    description="Lihat daftar Bon, status Piutang/Lunas, dan aksi pelunasan."
    eyebrow="Bon"
    empty-title="Belum ada Bon"
    empty-description="Setelah Bon dibuat, daftar transaksi akan tampil di sini dengan filter status dan pencarian."
    action-label="Buat Bon"
    action-to="/transactions/new"
    action-icon="lucide:plus"
  />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})
</script>
