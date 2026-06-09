<template>
  <AppShell>
    <div class="space-y-5">
      <PageHeader
        :title="`Rekap ${customer?.nama || 'Pelanggan'}`"
        description="Ringkasan per pelanggan."
        eyebrow="Laporan"
      >
        <template #actions>
          <AppButton
            :to="`/customers/${customerId}`"
            variant="secondary"
            icon="lucide:arrow-left"
            >Kembali</AppButton
          >
          <AppButton icon="lucide:printer" @click="exportReport">PDF</AppButton>
        </template>
      </PageHeader>

      <SectionPanel title="Periode">
        <AppTextInput v-model="period" label="Bulan" type="month" />
      </SectionPanel>

      <DashboardSummaryGrid :metrics="summaryCards" />
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import type { Database } from "~~/types/database.types";

definePageMeta({ middleware: ["auth"] });

const supabase = useSupabaseClient<Database>();
const route = useRoute();
const { exportHtml } = usePdfExport();
const customerId = String(route.params.id);
const period = ref(currentMonthValue());

const { data } = await useAsyncData(
  `recap-customer-${customerId}`,
  async () => {
    const [customerResult, transactionResult] = await Promise.all([
      supabase.from("customers").select("*").eq("id", customerId).single(),
      supabase
        .from("transactions")
        .select("*, transaction_lines(*)")
        .eq("customer_id", customerId)
        .order("tanggal", { ascending: false }),
    ]);

    if (customerResult.error) throw customerResult.error;
    if (transactionResult.error) throw transactionResult.error;

    return {
      customer: customerResult.data,
      transactions: transactionResult.data ?? [],
    };
  },
);

const customer = computed(() => data.value?.customer);
const filtered = computed(() => {
  const { year, month } = splitMonthValue(period.value);
  return (data.value?.transactions ?? []).filter((transaction) => {
    const date = new Date(transaction.tanggal);
    return (
      date.getFullYear() === year &&
      date.getMonth() + 1 === month &&
      !transaction.is_bonus
    );
  });
});

function omzet(transaction: {
  transaction_lines?: Array<{ line_omzet: number | string }>;
}) {
  return (transaction.transaction_lines ?? []).reduce(
    (total, line) => total + toNumber(line.line_omzet),
    0,
  );
}

function profit(transaction: {
  transaction_lines?: Array<{ line_laba_hl: number | string }>;
}) {
  return (transaction.transaction_lines ?? []).reduce(
    (total, line) => total + toNumber(line.line_laba_hl),
    0,
  );
}

const summary = computed(() => {
  const paid = filtered.value.filter(
    (transaction) => transaction.status === "lunas",
  );
  const receivable = filtered.value.filter(
    (transaction) => transaction.status === "piutang",
  );

  return {
    omzet: paid.reduce((total, transaction) => total + omzet(transaction), 0),
    laba: paid.reduce((total, transaction) => total + profit(transaction), 0),
    piutang: receivable.reduce(
      (total, transaction) =>
        total + omzet(transaction) + toNumber(transaction.ongkir),
      0,
    ),
    paid: paid.reduce(
      (total, transaction) =>
        total + omzet(transaction) + toNumber(transaction.ongkir),
      0,
    ),
  };
});

const summaryCards = computed(() => [
  {
    label: "Omzet Lunas",
    value: formatRp(summary.value.omzet),
    helper: "Ongkir tidak dihitung",
    icon: "lucide:chart-column",
  },
  {
    label: "Laba HL",
    value: formatRp(summary.value.laba),
    helper: "Internal",
    icon: "lucide:trending-up",
  },
  {
    label: "Piutang",
    value: formatRp(summary.value.piutang),
    helper: "Belum lunas",
    icon: "lucide:wallet",
  },
  {
    label: "Sudah Dibayar",
    value: formatRp(summary.value.paid),
    helper: "Omzet + ongkir",
    icon: "lucide:badge-check",
  },
]);

function exportReport() {
  exportHtml(
    `HL - Rekap ${customer.value?.nama || "Pelanggan"}`,
    `<h1>HL - Rekap ${customer.value?.nama || "Pelanggan"}</h1><p>Periode ${period.value}</p><table><tbody><tr><th>Omzet Lunas</th><td class="right">${formatRp(summary.value.omzet)}</td></tr><tr><th>Laba HL</th><td class="right">${formatRp(summary.value.laba)}</td></tr><tr><th>Piutang</th><td class="right">${formatRp(summary.value.piutang)}</td></tr><tr><th>Sudah Dibayar</th><td class="right">${formatRp(summary.value.paid)}</td></tr></tbody></table>`,
  );
}
</script>
