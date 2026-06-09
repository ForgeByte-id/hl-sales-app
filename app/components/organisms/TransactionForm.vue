<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <PageHeader
      :title="title"
      description="Pilih pelanggan dan produk, harga akan dihitung otomatis."
      eyebrow="Bon"
    >
      <template #actions>
        <AppButton
          to="/transactions"
          variant="secondary"
          icon="lucide:arrow-left"
          >Kembali</AppButton
        >
        <AppButton type="submit" icon="lucide:save">{{
          submitLabel
        }}</AppButton>
      </template>
    </PageHeader>

    <SectionPanel title="Data Bon">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AppTextInput
          v-model="form.nomor_bon"
          label="Nomor Bon"
          placeholder="Contoh: BON-001"
          :helper="checkingBon ? 'Mengecek nomor bon...' : ''"
          :error="fieldErrors.nomor_bon"
          @blur="checkNomorBon"
        />
        <AppTextInput
          v-model="form.tanggal"
          label="Tanggal"
          type="date"
          :error="fieldErrors.tanggal"
        />
        <SearchableSelect
          v-model="form.customer_id"
          label="Pelanggan"
          placeholder="Pilih pelanggan"
          search-placeholder="Cari pelanggan"
          :options="customerOptions"
          :error="fieldErrors.customer_id"
        />
        <AppTextInput
          v-model="form.ongkir"
          label="Ongkir"
          placeholder="0"
          :error="fieldErrors.ongkir"
        />
        <label class="block">
          <span
            class="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >Status</span
          >
          <select
            v-model="form.status"
            class="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <option value="piutang">Piutang</option>
            <option value="lunas">Lunas</option>
          </select>
        </label>
        <label
          class="flex h-10 items-center gap-2 self-end rounded-md border border-neutral-200 px-3 text-sm dark:border-neutral-800"
        >
          <input v-model="form.is_bonus" type="checkbox" class="size-4" />
          <span>Bon Bonus</span>
        </label>
        <AppTextInput
          v-if="form.is_bonus"
          v-model="form.bonus_units"
          label="Jumlah Bonus"
          type="number"
          min="1"
          placeholder="1"
          helper="Jumlah jatah bonus yang dipakai."
          :error="fieldErrors.bonus_units"
        />
      </div>
      <div class="mt-4">
        <AppTextInput
          v-model="form.deskripsi"
          label="Catatan"
          placeholder="Opsional"
        />
      </div>
    </SectionPanel>

    <SectionPanel title="Produk">
      <div class="space-y-3">
        <div
          v-for="(line, index) in lines"
          :key="index"
          class="grid gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800 lg:grid-cols-[1fr_90px_130px_130px_130px_auto]"
        >
          <SearchableSelect
            v-model="line.product_id"
            label="Produk"
            placeholder="Pilih produk"
            search-placeholder="Cari produk"
            :options="productOptions"
            :error="fieldErrors[`line_${index}_product`]"
          />
          <AppTextInput
            v-model="line.qty"
            label="Qty"
            type="number"
            min="1"
            :error="fieldErrors[`line_${index}_qty`]"
          />
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              Diskon
            </p>
            <p
              class="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50"
            >
              {{ lineDiscountLabel(index) }}
            </p>
          </div>
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              Harga
            </p>
            <p
              class="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50"
            >
              {{ formatRp(linePreview(index).discounted_price) }}
            </p>
          </div>
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              Omzet
            </p>
            <p
              class="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50"
            >
              {{ formatRp(linePreview(index).line_omzet) }}
            </p>
          </div>
          <AppIconButton
            icon="lucide:trash"
            label="Hapus produk"
            @click="removeLine(index)"
          />
        </div>
      </div>
      <template #action>
        <AppButton
          variant="secondary"
          size="sm"
          icon="lucide:plus"
          @click="addLine"
          >Tambah Produk</AppButton
        >
      </template>
    </SectionPanel>

    <SectionPanel title="Ringkasan">
      <div class="grid gap-3 md:grid-cols-4">
        <SummaryCard
          label="Omzet"
          :value="formatRp(calculation.totals.omzet)"
          helper="Ongkir tidak dihitung"
          icon="lucide:chart-column"
        />
        <SummaryCard
          label="Ongkir"
          :value="formatRp(parseRpInput(form.ongkir))"
          helper="Biaya kirim"
          icon="lucide:truck"
        />
        <SummaryCard
          label="Tagihan"
          :value="formatRp(calculation.totals.tagihan)"
          helper="Omzet + ongkir"
          icon="lucide:receipt-text"
        />
        <SummaryCard
          label="Laba HL"
          :value="formatRp(calculation.totals.labaHl)"
          helper="Internal"
          icon="lucide:trending-up"
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
import type { Database } from "~~/types/database.types";
import type {
  ProductType,
  TransactionLineInput,
  TransactionStatus,
} from "~/composables/useTransactionCalc";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];
type DiscountStep = Database["public"]["Tables"]["discount_steps"]["Row"];

function normalizeProductType(value: string): ProductType {
  return value === "BR" ? "BR" : "LM";
}

function normalizeTransactionStatus(value: string): TransactionStatus {
  return value === "lunas" ? "lunas" : "piutang";
}

function toTransactionProductInput(
  product: Product,
): TransactionLineInput["product"] {
  return {
    id: product.id,
    tipe: normalizeProductType(product.tipe),
    harga_modal: toNumber(product.harga_modal),
    harga_base: toNumber(product.harga_base),
  };
}

const props = withDefaults(
  defineProps<{
    title: string;
    submitLabel: string;
    transactionId?: string | null;
    customers: Customer[];
    products: Product[];
    discountSteps: DiscountStep[];
    initial?: {
      nomor_bon: string;
      tanggal: string;
      customer_id: string;
      ongkir: number | string;
      deskripsi: string | null;
      is_bonus: boolean;
      status: string;
      lines: Array<{ product_id: string; qty: number | string }>;
    };
  }>(),
  {
    transactionId: null,
    initial: () => ({
      nomor_bon: "",
      tanggal: todayInputValue(),
      customer_id: "",
      ongkir: 0,
      deskripsi: "",
      is_bonus: false,
      status: "piutang",
      lines: [{ product_id: "", qty: 1 }],
    }),
  },
);

const emit = defineEmits<{
  submit: [
    payload: {
      transaction: {
        nomor_bon: string;
        tanggal: string;
        customer_id: string;
        ongkir: number;
        deskripsi: string | null;
        is_bonus: boolean;
        status: TransactionStatus;
        tanggal_lunas: string | null;
      };
      lines: ReturnType<typeof calculateTransaction>["lines"];
      bonus_units: number;
    },
  ];
}>();

const supabase = useSupabaseClient<Database>();
const message = ref("");
const checkingBon = ref(false);
const fieldErrors = reactive<Record<string, string>>({});

const form = reactive<{
  nomor_bon: string;
  tanggal: string;
  customer_id: string;
  ongkir: string;
  deskripsi: string;
  is_bonus: boolean;
  bonus_units: string;
  status: TransactionStatus;
}>({
  nomor_bon: props.initial.nomor_bon,
  tanggal: props.initial.tanggal,
  customer_id: props.initial.customer_id,
  ongkir: String(props.initial.ongkir),
  deskripsi: props.initial.deskripsi ?? "",
  is_bonus: props.initial.is_bonus,
  bonus_units: "1",
  status: normalizeTransactionStatus(props.initial.status),
});

const lines = ref(
  props.initial.lines.map((line) => ({
    product_id: line.product_id,
    qty: String(line.qty),
  })),
);

const discounts = computed(() => {
  const map = { LM: [] as number[], BR: [] as number[] };
  const customerSteps = props.discountSteps.filter(
    (step) => step.customer_id === form.customer_id,
  );

  for (const type of ["LM", "BR"] as const) {
    map[type] = customerSteps
      .filter((step) => step.product_type === type)
      .sort((a, b) => a.step_order - b.step_order)
      .map((step) => toNumber(step.percentage));
  }

  return map;
});

const customerOptions = computed(() =>
  props.customers.map((customer) => ({
    value: customer.id,
    label: customer.nama,
  })),
);

const productOptions = computed(() =>
  props.products.map((product) => ({
    value: product.id,
    label: `${product.nama} - ${product.tipe}`,
  })),
);

function selectedLineInputs(): TransactionLineInput[] {
  return lines.value
    .map((line) => {
      const product = props.products.find(
        (item) => item.id === line.product_id,
      );
      if (!product) return null;

      return {
        product: toTransactionProductInput(product),
        qty: Number(line.qty) || 1,
      };
    })
    .filter((line): line is TransactionLineInput => Boolean(line));
}

const calculation = computed(() =>
  calculateTransaction(
    selectedLineInputs(),
    discounts.value,
    parseRpInput(form.ongkir),
    form.status,
    form.is_bonus,
  ),
);

function linePreview(index: number) {
  const product = props.products.find(
    (item) => item.id === lines.value[index]?.product_id,
  );

  if (!product) return { discounted_price: 0, line_omzet: 0 };

  const preview = calculateTransaction(
    [
      {
        product: toTransactionProductInput(product),
        qty: Number(lines.value[index]?.qty) || 1,
      },
    ],
    discounts.value,
    0,
    form.status,
    form.is_bonus,
  ).lines[0];

  return preview ?? { discounted_price: 0, line_omzet: 0 };
}

function lineDiscountLabel(index: number) {
  const product = props.products.find(
    (item) => item.id === lines.value[index]?.product_id,
  );
  if (!product) return "-";

  return discountChainLabel(
    discounts.value[normalizeProductType(product.tipe)],
  );
}

function addLine() {
  lines.value.push({ product_id: "", qty: "1" });
}

function removeLine(index: number) {
  lines.value = lines.value.filter((_, itemIndex) => itemIndex !== index);
  if (lines.value.length === 0) addLine();
}

async function checkNomorBon() {
  const nomorBon = form.nomor_bon.trim();
  fieldErrors.nomor_bon = "";

  if (!nomorBon) {
    fieldErrors.nomor_bon = "Nomor Bon wajib diisi.";
    return false;
  }

  checkingBon.value = true;
  let query = supabase
    .from("transactions")
    .select("id")
    .eq("nomor_bon", nomorBon)
    .limit(1);

  if (props.transactionId) {
    query = query.neq("id", props.transactionId);
  }

  const { data, error } = await query;
  checkingBon.value = false;

  if (error) {
    fieldErrors.nomor_bon = "Nomor Bon belum bisa dicek.";
    return false;
  }

  if ((data ?? []).length > 0) {
    fieldErrors.nomor_bon = "Nomor bon sudah digunakan.";
    return false;
  }

  return true;
}

function validateFields() {
  for (const key of Object.keys(fieldErrors)) fieldErrors[key] = "";

  if (!form.nomor_bon.trim()) fieldErrors.nomor_bon = "Nomor Bon wajib diisi.";
  if (!form.tanggal) fieldErrors.tanggal = "Tanggal wajib diisi.";
  if (!form.customer_id)
    fieldErrors.customer_id = "Pilih pelanggan terlebih dahulu.";
  if (form.is_bonus && Number(form.bonus_units) < 1)
    fieldErrors.bonus_units = "Jumlah bonus minimal 1.";

  lines.value.forEach((line, index) => {
    if (!line.product_id)
      fieldErrors[`line_${index}_product`] = "Pilih produk.";
    if (Number(line.qty) < 1)
      fieldErrors[`line_${index}_qty`] = "Qty minimal 1.";
  });

  return !Object.values(fieldErrors).some(Boolean);
}

async function handleSubmit() {
  message.value = "";

  if (!validateFields()) {
    message.value = "Periksa kembali data yang ditandai.";
    return;
  }

  if (!(await checkNomorBon())) {
    message.value = "Periksa kembali data yang ditandai.";
    return;
  }

  if (calculation.value.lines.length === 0) {
    message.value = "Minimal satu produk wajib diisi.";
    return;
  }

  emit("submit", {
    transaction: {
      nomor_bon: form.nomor_bon.trim(),
      tanggal: form.tanggal,
      customer_id: form.customer_id,
      ongkir: parseRpInput(form.ongkir),
      deskripsi: form.deskripsi.trim() || null,
      is_bonus: form.is_bonus,
      status: form.status,
      tanggal_lunas: form.status === "lunas" ? form.tanggal : null,
    },
    lines: calculation.value.lines,
    bonus_units: form.is_bonus ? Math.max(1, Number(form.bonus_units) || 1) : 0,
  });
}
</script>
