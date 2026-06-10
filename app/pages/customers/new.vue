<template>
  <AppShell>
    <form class="space-y-5" @submit.prevent="saveCustomer">
      <PageHeader
        title="Tambah Pelanggan"
        description="Isi data pelanggan dan aturan diskon."
        eyebrow="Pelanggan"
      >
        <template #actions>
          <AppButton
            to="/customers"
            variant="secondary"
            icon="lucide:arrow-left"
            >Kembali</AppButton
          >
          <AppButton type="submit" icon="lucide:save" :disabled="saving">{{
            saving ? "Menyimpan..." : "Simpan"
          }}</AppButton>
        </template>
      </PageHeader>

      <SectionPanel title="Data Pelanggan">
        <div class="grid gap-4 md:grid-cols-2">
          <AppTextInput
            v-model="form.nama"
            label="Nama"
            placeholder="Nama pelanggan"
            :error="fieldErrors.nama"
          />
          <AppTextInput
            v-model="form.bonus_threshold"
            label="Threshold Bonus"
            placeholder="0"
            helper="Isi 0 jika belum ada program bonus."
          />
        </div>
      </SectionPanel>

      <SectionPanel
        title="Diskon Bertingkat"
        description="Urutan diskon dihitung satu per satu. Contoh: 20, 20, 10."
      >
        <div class="grid gap-5 lg:grid-cols-2">
          <DiscountEditor v-model="lmSteps" title="Diskon LM" />
          <DiscountEditor v-model="brSteps" title="Diskon BR" />
        </div>
      </SectionPanel>

      <p
        v-if="message"
        class="rounded-md bg-red-50 px-3 py-2 text-sm text-danger-text dark:bg-red-950 dark:text-danger-darkText"
      >
        {{ message }}
      </p>
    </form>
  </AppShell>
</template>

<script setup lang="ts">
import type { Database } from "~~/types/database.types";

definePageMeta({ middleware: ["auth"] });

const supabase = useSupabaseClient<Database>();
const router = useRouter();
const saving = ref(false);
const message = ref("");
const fieldErrors = reactive<Record<string, string>>({});
const form = reactive({ nama: "", bonus_threshold: "0" });
const lmSteps = ref<string[]>([]);
const brSteps = ref<string[]>([]);

function parseSteps(values: string[], label: string) {
  const steps: number[] = [];

  values.forEach((value, index) => {
    if (value === "") return;

    const percentage = Number(value);
    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
      fieldErrors[`${label}_${index}`] =
        `Diskon ${label} langkah ${index + 1} harus 0-100.`;
      return;
    }

    steps.push(percentage);
  });

  return steps;
}

async function saveCustomer() {
  message.value = "";
  for (const key of Object.keys(fieldErrors)) fieldErrors[key] = "";
  if (!form.nama.trim()) {
    fieldErrors.nama = "Nama wajib diisi.";
  }

  const lm = parseSteps(lmSteps.value, "LM");
  const br = parseSteps(brSteps.value, "BR");

  if (Object.values(fieldErrors).some(Boolean)) {
    message.value =
      Object.values(fieldErrors).find(Boolean) ||
      "Periksa kembali data yang ditandai.";
    return;
  }

  saving.value = true;
  const { data, error } = await supabase.rpc("save_customer", {
    p_customer_id: null,
    p_nama: form.nama.trim(),
    p_bonus_threshold: parseRpInput(form.bonus_threshold),
    p_lm_steps: lm,
    p_br_steps: br,
  });

  if (error || !data) {
    message.value = error?.message || "Pelanggan belum bisa disimpan.";
    saving.value = false;
    return;
  }

  saving.value = false;
  await router.push(`/customers/${data}`);
}
</script>
