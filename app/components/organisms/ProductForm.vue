<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <PageHeader
      :title="title"
      description="Harga modal dipakai untuk hitung laba internal."
      eyebrow="Produk"
    >
      <template #actions>
        <AppButton to="/products" variant="secondary" icon="lucide:arrow-left"
          >Kembali</AppButton
        >
        <AppButton type="submit" icon="lucide:save" :disabled="saving">{{
          saving ? "Menyimpan..." : submitLabel
        }}</AppButton>
      </template>
    </PageHeader>

    <SectionPanel title="Data Produk">
      <div class="grid gap-4 md:grid-cols-2">
        <AppTextInput
          v-model="form.nama"
          label="Nama"
          placeholder="Nama produk"
        />
        <label class="block">
          <span
            class="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >Tipe</span
          >
          <select
            v-model="form.tipe"
            class="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <option value="LM">LM</option>
            <option value="BR">BR</option>
          </select>
        </label>
        <AppTextInput
          v-model="form.harga_base"
          label="Harga Base"
          placeholder="0"
        />
        <AppTextInput
          v-model="form.harga_modal"
          label="Harga Modal"
          placeholder="0"
          helper="Hanya untuk perhitungan internal."
        />
      </div>
    </SectionPanel>

    <p
      v-if="message"
      class="rounded-md bg-red-50 px-3 py-2 text-sm text-danger-text dark:bg-red-950 dark:text-danger-darkText"
    >
      {{ message }}
    </p>
  </form>
</template>

<script setup lang="ts">
type ProductFormType = "LM" | "BR";

function normalizeProductType(value: string): ProductFormType {
  return value === "BR" ? "BR" : "LM";
}

const props = withDefaults(
  defineProps<{
    title: string;
    submitLabel: string;
    initial?: {
      nama: string;
      tipe: string;
      harga_modal: number | string;
      harga_base: number | string;
    };
  }>(),
  {
    initial: () => ({
      nama: "",
      tipe: "LM",
      harga_modal: 0,
      harga_base: 0,
    }),
  },
);

const emit = defineEmits<{
  submit: [
    payload: {
      nama: string;
      tipe: ProductFormType;
      harga_modal: number;
      harga_base: number;
    },
  ];
}>();

const saving = ref(false);
const message = ref("");

const form = reactive<{
  nama: string;
  tipe: ProductFormType;
  harga_modal: string;
  harga_base: string;
}>({
  nama: props.initial.nama,
  tipe: normalizeProductType(props.initial.tipe),
  harga_modal: String(props.initial.harga_modal),
  harga_base: String(props.initial.harga_base),
});

async function handleSubmit() {
  message.value = "";

  if (!form.nama.trim()) {
    message.value = "Nama wajib diisi.";
    return;
  }

  const payload = {
    nama: form.nama.trim(),
    tipe: form.tipe,
    harga_modal: parseRpInput(form.harga_modal),
    harga_base: parseRpInput(form.harga_base),
  };

  saving.value = true;
  try {
    await emit("submit", payload);
  } catch (error) {
    message.value =
      error instanceof Error ? error.message : "Produk belum bisa disimpan.";
  } finally {
    saving.value = false;
  }
}
</script>
