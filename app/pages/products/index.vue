<template>
  <AppShell>
    <div class="space-y-5">
      <PageHeader title="Produk" description="Kelola produk aktif untuk Bon." eyebrow="Master Data">
        <template #actions>
          <AppButton to="/products/new" icon="lucide:package-plus">Tambah Produk</AppButton>
        </template>
      </PageHeader>

      <SectionPanel title="Daftar Produk">
        <div class="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
          <AppTextInput v-model="search" label="Cari" placeholder="Nama produk" icon="lucide:search" />
          <label class="block">
            <span class="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Tipe</span>
            <select v-model="typeFilter" class="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
              <option value="">Semua</option>
              <option value="LM">LM</option>
              <option value="BR">BR</option>
            </select>
          </label>
        </div>

        <EmptyState v-if="filteredProducts.length === 0" title="Belum ada produk" description="Tambahkan produk agar bisa dipilih pada Bon." icon="lucide:package" />
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
            <thead class="text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              <tr>
                <th class="px-3 py-2">Nama</th>
                <th class="px-3 py-2">Tipe</th>
                <th class="px-3 py-2">Harga Base</th>
                <th class="px-3 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
              <tr v-for="product in filteredProducts" :key="product.id">
                <td class="px-3 py-3 font-medium text-neutral-900 dark:text-neutral-50">{{ product.nama }}</td>
                <td class="px-3 py-3"><AppBadge>{{ product.tipe }}</AppBadge></td>
                <td class="px-3 py-3 text-neutral-600 dark:text-neutral-300">{{ formatRp(toNumber(product.harga_base)) }}</td>
                <td class="px-3 py-3">
                  <div class="flex justify-end gap-2">
                    <AppButton :to="`/products/${product.id}/edit`" variant="secondary" size="sm" icon="lucide:pencil">Edit</AppButton>
                    <AppButton variant="danger" size="sm" icon="lucide:archive" @click="archiveProduct(product.id)">Arsip</AppButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionPanel>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import type { Database } from '~~/types/database.types'

definePageMeta({ middleware: ['auth'] })

const supabase = useSupabaseClient<Database>()
const search = ref('')
const typeFilter = ref('')

const { data: products, refresh } = await useAsyncData('products-index', async () => {
  const { data, error } = await supabase.from('products').select('*').is('deleted_at', null).order('nama')
  if (error) throw error
  return data ?? []
})

const filteredProducts = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return (products.value ?? []).filter((product) => {
    const matchesKeyword = !keyword || product.nama.toLowerCase().includes(keyword)
    const matchesType = !typeFilter.value || product.tipe === typeFilter.value
    return matchesKeyword && matchesType
  })
})

async function archiveProduct(id: string) {
  if (!window.confirm('Arsipkan produk ini? Riwayat transaksi tetap tersimpan.')) return

  await supabase.from('products').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  await refresh()
}
</script>
