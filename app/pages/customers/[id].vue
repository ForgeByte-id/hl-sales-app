<template>
  <AppShell>
    <div class="space-y-5">
      <PageHeader
        :title="customer?.nama || 'Pelanggan'"
        description="Ringkasan piutang dan transaksi per bulan."
        eyebrow="Detail Pelanggan"
      >
        <template #actions>
          <AppButton
            to="/customers"
            variant="secondary"
            icon="lucide:arrow-left"
            >Kembali</AppButton
          >
          <AppButton
            :to="`/customers/${customerId}/edit`"
            variant="secondary"
            icon="lucide:pencil"
            >Edit</AppButton
          >
          <AppButton icon="lucide:printer" @click="exportList">PDF</AppButton>
        </template>
      </PageHeader>

      <SectionPanel title="Periode">
        <div class="flex flex-wrap items-end gap-3">
          <AppTextInput v-model="period" label="Bulan" type="month" />
          <AppTextInput
            v-model="settleDate"
            label="Tanggal Pelunasan"
            type="date"
          />
          <AppButton
            icon="lucide:badge-check"
            :disabled="settling"
            @click="settleMonth"
          >
            {{ settling ? "Memproses..." : "Sudah Lunas Bulan Ini" }}
          </AppButton>
        </div>
      </SectionPanel>

      <DashboardSummaryGrid :metrics="summaryCards" />

      <SectionPanel
        title="Daftar Bon"
        description="Klik detail untuk melihat baris produk."
      >
        <EmptyState
          v-if="filteredTransactions.length === 0"
          title="Belum ada Bon"
          description="Tidak ada transaksi pada periode ini."
          icon="lucide:receipt-text"
        />
        <div v-else class="overflow-x-auto">
          <table
            class="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800"
          >
            <thead
              class="text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              <tr>
                <th class="px-3 py-2">Tanggal</th>
                <th class="px-3 py-2">Nomor Bon</th>
                <th class="px-3 py-2">Status</th>
                <th class="px-3 py-2 text-right">Tagihan</th>
                <th class="px-3 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
              <tr
                v-for="transaction in filteredTransactions"
                :key="transaction.id"
              >
                <td class="px-3 py-3 text-neutral-600 dark:text-neutral-300">
                  {{ formatDate(transaction.tanggal) }}
                </td>
                <td
                  class="px-3 py-3 font-medium text-neutral-900 dark:text-neutral-50"
                >
                  {{ transaction.nomor_bon }}
                </td>
                <td class="px-3 py-3">
                  <StatusBadge
                    :status="
                      transaction.is_bonus ? 'bonus' : transaction.status
                    "
                  />
                </td>
                <td
                  class="px-3 py-3 text-right text-neutral-700 dark:text-neutral-200"
                >
                  {{ formatRp(transactionAmount(transaction)) }}
                </td>
                <td class="px-3 py-3">
                  <div class="flex justify-end gap-2">
                    <AppButton
                      :to="`/transactions/${transaction.id}`"
                      variant="secondary"
                      size="sm"
                      icon="lucide:eye"
                      >Detail</AppButton
                    >
                    <AppButton
                      v-if="transaction.status === 'piutang'"
                      variant="ghost"
                      size="sm"
                      icon="lucide:check"
                      @click="settleSingle(transaction.id)"
                    >
                      Lunas
                    </AppButton>
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
import type { Database } from "~~/types/database.types";

definePageMeta({ middleware: ["auth"] });

const supabase = useSupabaseClient<Database>();
const route = useRoute();
const { exportHtml } = usePdfExport();
const customerId = String(route.params.id);
const period = ref(currentMonthValue());
const settleDate = ref(todayInputValue());
const settling = ref(false);

const { data, refresh } = await useAsyncData(
  `customer-detail-${customerId}`,
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
const transactions = computed(() => data.value?.transactions ?? []);
const filteredTransactions = computed(() => {
  const { year, month } = splitMonthValue(period.value);
  return transactions.value.filter((transaction) => {
    const date = new Date(transaction.tanggal);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });
});

function lineOmzet(transaction: {
  transaction_lines?: Array<{ line_omzet: number | string }>;
}) {
  return (transaction.transaction_lines ?? []).reduce(
    (total, line) => total + toNumber(line.line_omzet),
    0,
  );
}

function lineProfit(transaction: {
  transaction_lines?: Array<{ line_laba_hl: number | string }>;
}) {
  return (transaction.transaction_lines ?? []).reduce(
    (total, line) => total + toNumber(line.line_laba_hl),
    0,
  );
}

function transactionAmount(transaction: {
  ongkir: number | string;
  transaction_lines?: Array<{ line_omzet: number | string }>;
}) {
  return lineOmzet(transaction) + toNumber(transaction.ongkir);
}

const summaryCards = computed(() => {
  const totalPiutang = filteredTransactions.value
    .filter(
      (transaction) =>
        transaction.status === "piutang" && !transaction.is_bonus,
    )
    .reduce((total, transaction) => total + transactionAmount(transaction), 0);
  const paidTransactions = filteredTransactions.value.filter(
    (transaction) => transaction.status === "lunas" && !transaction.is_bonus,
  );
  const totalPaid = paidTransactions.reduce(
    (total, transaction) => total + transactionAmount(transaction),
    0,
  );
  const totalOmzet = paidTransactions.reduce(
    (total, transaction) => total + lineOmzet(transaction),
    0,
  );
  const totalProfit = paidTransactions.reduce(
    (total, transaction) => total + lineProfit(transaction),
    0,
  );

  return [
    {
      label: "Total Piutang",
      value: formatRp(totalPiutang),
      helper: "Belum lunas",
      icon: "lucide:wallet",
    },
    {
      label: "Sudah Dibayar",
      value: formatRp(totalPaid),
      helper: "Bon lunas",
      icon: "lucide:badge-check",
    },
    {
      label: "Omzet Lunas",
      value: formatRp(totalOmzet),
      helper: "Ongkir tidak dihitung",
      icon: "lucide:chart-column",
    },
    {
      label: "Laba HL",
      value: formatRp(totalProfit),
      helper: "Internal",
      icon: "lucide:trending-up",
    },
  ];
});

async function settleMonth() {
  if (!window.confirm("Tandai semua Bon piutang bulan ini sebagai lunas?"))
    return;

  settling.value = true;
  const { year, month } = splitMonthValue(period.value);
  await supabase.rpc("settle_month", {
    p_customer_id: customerId,
    p_year: year,
    p_month: month,
    p_tanggal_lunas: settleDate.value,
  });
  settling.value = false;
  await refresh();
}

async function settleSingle(id: string) {
  await supabase
    .from("transactions")
    .update({ status: "lunas", tanggal_lunas: settleDate.value })
    .eq("id", id);
  await refresh();
}

function exportList() {
  const rows = filteredTransactions.value
    .map(
      (transaction) =>
        `<tr><td>${formatDate(transaction.tanggal)}</td><td>${transaction.nomor_bon}</td><td>${transaction.status}</td><td class="right">${formatRp(transactionAmount(transaction))}</td></tr>`,
    )
    .join("");

  exportHtml(
    `HL - ${customer.value?.nama || "Pelanggan"}`,
    `<h1>HL - ${customer.value?.nama || "Pelanggan"}</h1><p>Periode ${period.value}</p><table><thead><tr><th>Tanggal</th><th>Nomor Bon</th><th>Status</th><th class="right">Tagihan</th></tr></thead><tbody>${rows}</tbody></table>`,
  );
}
</script>
