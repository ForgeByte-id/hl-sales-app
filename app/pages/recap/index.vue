<template>
  <PlaceholderTemplate
    title="Rekap"
    description="Pantau omzet lunas, laba internal, piutang, dan pembayaran per periode."
    eyebrow="Laporan"
    empty-title="Rekap belum tersedia"
    empty-description="Rekap akan dihitung dari transaksi Lunas. Harga modal hanya tampil di laporan internal."
  />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})
</script>
