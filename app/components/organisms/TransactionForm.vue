<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <PageHeader :title="title" description="Pilih pelanggan dan produk, harga akan dihitung otomatis." eyebrow="Bon">
      <template #actions>
        <AppButton to="/transactions" variant="secondary" icon="lucide:arrow-left">Kembali</AppButton>
        <AppButton type="submit" icon="lucide:save">{{ submitLabel }}</AppButton>
      </template>
    </PageHeader>

    <SectionPanel title="Data Bon">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AppTextInput v-model="form.nomor_bon" label="Nomor Bon" placeholder="Contoh: BON-001" />
        <AppTextInput v-model="form.tanggal" label="Tanggal" type="date" />
        <label class="block">
          <span class="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Pelanggan</span>
          <select v-model="form.customer_id" class="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
            <option value="">Pilih pelanggan</option>
            <option v-for="customer in customers" :key="customer.id" :value="customer.id">{{ customer.nama }}</option>
          </select>
        </label>
        <AppTextInput v-model="form.ongkir" label="Ongkir" placeholder="0" />
        <label class="block">
          <span class="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Status</span>
          <select v-model="form.status" class="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
            <option value="piutang">Piutang</option>
            <option value="lunas">Lunas</option>
          </select>
        </label>
        <label class="flex h-10 items-center gap-2 self-end rounded-md border border-neutral-200 px-3 text-sm dark:border-neutral-800">
          <input v-model="form.is_bonus" type="checkbox" class="size-4">
          <span>Bon Bonus</span>
        </label>
      </div>
      <div class="mt-4">
        <AppTextInput v-model="form.deskripsi" label="Catatan" placeholder="Opsional" />
      </div>
    </SectionPanel>

    <SectionPanel title="Produk">
      <div class="space-y-3">
        <div
          v-for="(line, index) in lines"
          :key="index"
          class="grid gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800 lg:grid-cols-[1fr_110px_140px_140px_auto]"
        >
          <label class="block">
            <span class="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Produk</span>
            <select v-model="line.product_id" class="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
              <option value="">Pilih produk</option>
              <option v-for="product in products" :key="product.id" :value="product.id">{{ product.nama }} - {{ product.tipe }}</option>
            </select>
          </label>
          <AppTextInput v-model="line.qty" label="Qty" type="number" />
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Harga</p>
            <p class="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">{{ formatRp(linePreview(index).discounted_price) }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Omzet</p>
            <p class="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">{{ formatRp(linePreview(index).line_omzet) }}</p>
          </div>
          <AppIconButton icon="lucide:trash" label="Hapus produk" @click="removeLine(index)" />
        </div>
      </div>
      <template #action>
        <AppButton variant="secondary" size="sm" icon="lucide:plus" @click="addLine">Tambah Produk</AppButton>
      </template>
    </SectionPanel>

    <SectionPanel title="Ringkasan">
      <div class="grid gap-3 md:grid-cols-4">
        <SummaryCard label="Omzet" :value="formatRp(calculation.totals.omzet)" helper="Ongkir tidak dihitung" icon="lucide:chart-column" />
        <SummaryCard label="Ongkir" :value="formatRp(parseRpInput(form.ongkir))" helper="Biaya kirim" icon="lucide:truck" />
        <SummaryCard label="Tagihan" :value="formatRp(calculation.totals.tagihan)" helper="Omzet + ongkir" icon="lucide:receipt-text" />
        <SummaryCard label="Laba HL" :value="formatRp(calculation.totals.labaHl)" helper="Internal" icon="lucide:trending-up" />
      </div>
    </SectionPanel>

    <p v-if="message" class="rounded-md bg-red-50 px-3 py-2 text-sm text-danger-text dark:bg-red-950 dark:text-danger-darkText">{{ message }}</p>
  </form>
</template>

<script setup lang="ts">
import type { Database } from '~~/types/database.types'

type Customer = Database['public']['Tables']['customers']['Row']
type Product = Database['public']['Tables']['products']['Row']
type DiscountStep = Database['public']['Tables']['discount_steps']['Row']

const props = withDefaults(
  defineProps<{
    title: string
    submitLabel: string
    customers: Customer[]
    products: Product[]
    discountSteps: DiscountStep[]
    initial?: {
      nomor_bon: string
      tanggal: string
      customer_id: string
      ongkir: number | string
      deskripsi: string | null
      is_bonus: boolean
      status: 'piutang' | 'lunas'
      lines: Array<{ product_id: string; qty: number | string }>
    }
  }>(),
  {
    initial: () => ({
      nomor_bon: '',
      tanggal: todayInputValue(),
      customer_id: '',
      ongkir: 0,
      deskripsi: '',
      is_bonus: false,
      status: 'piutang',
      lines: [{ product_id: '', qty: 1 }],
    }),
  },
)

const emit = defineEmits<{
  submit: [payload: {
    transaction: {
      nomor_bon: string
      tanggal: string
      customer_id: string
      ongkir: number
      deskripsi: string | null
      is_bonus: boolean
      status: 'piutang' | 'lunas'
      tanggal_lunas: string | null
    }
    lines: ReturnType<typeof calculateTransaction>['lines']
  }]
}>()

const message = ref('')
const form = reactive({
  nomor_bon: props.initial.nomor_bon,
  tanggal: props.initial.tanggal,
  customer_id: props.initial.customer_id,
  ongkir: String(props.initial.ongkir),
  deskripsi: props.initial.deskripsi ?? '',
  is_bonus: props.initial.is_bonus,
  status: props.initial.status,
})
const lines = ref(props.initial.lines.map((line) => ({ product_id: line.product_id, qty: String(line.qty) })))

const discounts = computed(() => {
  const map = { LM: [] as number[], BR: [] as number[] }
  const customerSteps = props.discountSteps.filter((step) => step.customer_id === form.customer_id)

  for (const type of ['LM', 'BR'] as const) {
    map[type] = customerSteps
      .filter((step) => step.product_type === type)
      .sort((a, b) => a.step_order - b.step_order)
      .map((step) => toNumber(step.percentage))
  }

  return map
})

function selectedLineInputs() {
  return lines.value
    .map((line) => {
      const product = props.products.find((item) => item.id === line.product_id)
      if (!product) return null
      return { product, qty: Number(line.qty) || 1 }
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line))
}

const calculation = computed(() =>
  calculateTransaction(selectedLineInputs(), discounts.value, parseRpInput(form.ongkir), form.status, form.is_bonus),
)

function linePreview(index: number) {
  const product = props.products.find((item) => item.id === lines.value[index]?.product_id)
  if (!product) {
    return { discounted_price: 0, line_omzet: 0 }
  }

  return calculateTransaction(
    [{ product, qty: Number(lines.value[index]?.qty) || 1 }],
    discounts.value,
    0,
    form.status,
    form.is_bonus,
  ).lines[0]
}

function addLine() {
  lines.value.push({ product_id: '', qty: '1' })
}

function removeLine(index: number) {
  lines.value = lines.value.filter((_, itemIndex) => itemIndex !== index)
  if (lines.value.length === 0) addLine()
}

function handleSubmit() {
  message.value = ''

  if (!form.nomor_bon.trim() || !form.customer_id || calculation.value.lines.length === 0) {
    message.value = 'Nomor Bon, pelanggan, dan minimal satu produk wajib diisi.'
    return
  }

  emit('submit', {
    transaction: {
      nomor_bon: form.nomor_bon.trim(),
      tanggal: form.tanggal,
      customer_id: form.customer_id,
      ongkir: parseRpInput(form.ongkir),
      deskripsi: form.deskripsi.trim() || null,
      is_bonus: form.is_bonus,
      status: form.status,
      tanggal_lunas: form.status === 'lunas' ? form.tanggal : null,
    },
    lines: calculation.value.lines,
  })
}
</script>
