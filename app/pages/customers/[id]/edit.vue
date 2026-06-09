<template>
  <AppShell>
    <form class="space-y-5" @submit.prevent="saveCustomer">
      <PageHeader title="Edit Pelanggan" description="Perbarui data pelanggan dan diskon." eyebrow="Pelanggan">
        <template #actions>
          <AppButton :to="`/customers/${customerId}`" variant="secondary" icon="lucide:arrow-left">Kembali</AppButton>
          <AppButton type="submit" icon="lucide:save" :disabled="saving">{{ saving ? 'Menyimpan...' : 'Simpan' }}</AppButton>
        </template>
      </PageHeader>

      <SectionPanel title="Data Pelanggan">
        <div class="grid gap-4 md:grid-cols-2">
          <AppTextInput v-model="form.nama" label="Nama" placeholder="Nama pelanggan" />
          <AppTextInput v-model="form.bonus_threshold" label="Threshold Bonus" placeholder="0" />
        </div>
      </SectionPanel>

      <SectionPanel title="Diskon Bertingkat">
        <div class="grid gap-5 lg:grid-cols-2">
          <DiscountEditor v-model="lmSteps" title="Diskon LM" />
          <DiscountEditor v-model="brSteps" title="Diskon BR" />
        </div>
      </SectionPanel>

      <p v-if="message" class="rounded-md bg-red-50 px-3 py-2 text-sm text-danger-text dark:bg-red-950 dark:text-danger-darkText">
        {{ message }}
      </p>
    </form>
  </AppShell>
</template>

<script setup lang="ts">
import type { Database } from '~~/types/database.types'

definePageMeta({ middleware: ['auth'] })

const supabase = useSupabaseClient<Database>()
const route = useRoute()
const router = useRouter()
const customerId = String(route.params.id)
const saving = ref(false)
const message = ref('')
const form = reactive({ nama: '', bonus_threshold: '0' })
const lmSteps = ref<string[]>([])
const brSteps = ref<string[]>([])

const { data } = await useAsyncData(`customer-edit-${customerId}`, async () => {
  const [customerResult, stepsResult] = await Promise.all([
    supabase.from('customers').select('*').eq('id', customerId).single(),
    supabase.from('discount_steps').select('*').eq('customer_id', customerId).order('product_type').order('step_order'),
  ])

  if (customerResult.error) throw customerResult.error
  if (stepsResult.error) throw stepsResult.error

  return { customer: customerResult.data, steps: stepsResult.data ?? [] }
})

if (data.value?.customer) {
  form.nama = data.value.customer.nama
  form.bonus_threshold = String(data.value.customer.bonus_threshold)
  lmSteps.value = data.value.steps.filter((step) => step.product_type === 'LM').map((step) => String(step.percentage))
  brSteps.value = data.value.steps.filter((step) => step.product_type === 'BR').map((step) => String(step.percentage))
}

function parseSteps(values: string[]) {
  return values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value >= 0 && value <= 100)
}

async function replaceSteps(type: 'LM' | 'BR', values: number[]) {
  await supabase.from('discount_steps').delete().eq('customer_id', customerId).eq('product_type', type)
  if (!values.length) return

  await supabase.from('discount_steps').insert(
    values.map((percentage, index) => ({
      customer_id: customerId,
      product_type: type,
      step_order: index + 1,
      percentage,
    })),
  )
}

async function saveCustomer() {
  message.value = ''
  if (!form.nama.trim()) {
    message.value = 'Nama wajib diisi.'
    return
  }

  saving.value = true
  const { error } = await supabase
    .from('customers')
    .update({
      nama: form.nama.trim(),
      bonus_threshold: parseRpInput(form.bonus_threshold),
    })
    .eq('id', customerId)

  if (error) {
    message.value = error.message
    saving.value = false
    return
  }

  await replaceSteps('LM', parseSteps(lmSteps.value))
  await replaceSteps('BR', parseSteps(brSteps.value))
  saving.value = false
  await router.push(`/customers/${customerId}`)
}
</script>
