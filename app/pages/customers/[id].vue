<template>
  <AppShell>
    <div class="space-y-5">
      <PageHeader
        :title="customer?.nama || 'Pelanggan'"
        description="Ringkasan piutang, pembayaran, dan bonus per bulan."
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
          <AppButton
            :to="`/transactions/new?customer=${customerId}&bonus=1`"
            variant="secondary"
            icon="lucide:gift"
            >Buat Bon Bonus</AppButton
          >
        </template>
      </PageHeader>

      <SectionPanel title="Periode">
        <div class="flex flex-wrap items-end gap-3">
          <AppTextInput v-model="period" label="Bulan" type="month" />
          <AppButton
            icon="lucide:badge-check"
            :disabled="settling"
            @click="openSettleMonth"
          >
            {{ settling ? "Memproses..." : "Sudah Lunas Bulan Ini" }}
          </AppButton>
          <AppButton
            variant="secondary"
            icon="lucide:printer"
            @click="exportPiutang"
            >PDF Piutang</AppButton
          >
          <AppButton
            variant="secondary"
            icon="lucide:printer"
            @click="exportAll"
            >PDF Semua Bon</AppButton
          >
        </div>
      </SectionPanel>

      <SectionPanel title="Bonus">
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p
              class="text-sm font-medium text-neutral-900 dark:text-neutral-50"
            >
              Bonus tersedia: {{ bonusAvailable }}
            </p>
            <p class="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
              Dihitung dari omzet lunas, tidak termasuk Bon Bonus.
            </p>
          </div>
          <AppButton
            :to="`/transactions/new?customer=${customerId}&bonus=1`"
            icon="lucide:gift"
            :disabled="bonusAvailable < 1"
          >
            Buat Bon Bonus
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
                  class="px-3 py-3 text-right font-mono text-neutral-700 dark:text-neutral-200"
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
                      v-if="
                        transaction.status === 'piutang' &&
                        !transaction.is_bonus
                      "
                      variant="ghost"
                      size="sm"
                      icon="lucide:check"
                      @click="openSettleSingle(transaction.id)"
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

      <Teleport to="body">
        <div
          v-if="settleDialog.open"
          class="fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/40 p-4 sm:items-center"
        >
          <section
            class="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h2
              class="text-base font-semibold text-neutral-900 dark:text-neutral-50"
            >
              {{ settleDialog.title }}
            </h2>
            <p
              class="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400"
            >
              Pilih tanggal pelunasan. Data akan langsung diperbarui setelah
              disimpan.
            </p>
            <div class="mt-4">
              <AppTextInput
                v-model="settleDate"
                label="Tanggal Pelunasan"
                type="date"
              />
            </div>
            <div
              class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
            >
              <AppButton variant="secondary" @click="closeSettleDialog"
                >Batal</AppButton
              >
              <AppButton
                icon="lucide:badge-check"
                :disabled="settling"
                @click="confirmSettle"
              >
                {{ settling ? "Memproses..." : "Lunasi" }}
              </AppButton>
            </div>
          </section>
        </div>
      </Teleport>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import type { Database } from "~~/types/database.types";

definePageMeta({ middleware: ["auth"] });

type TransactionWithLines =
  Database["public"]["Tables"]["transactions"]["Row"] & {
    transaction_lines?: Array<
      Database["public"]["Tables"]["transaction_lines"]["Row"]
    >;
  };

const supabase = useSupabaseClient<Database>();
const route = useRoute();
const toast = useToast();
const { exportHtml } = usePdfExport();
const customerId = String(route.params.id);
const period = ref(currentMonthValue());
const settleDate = ref(todayInputValue());
const settling = ref(false);
const settleDialog = reactive<{
  open: boolean;
  mode: "month" | "single";
  transactionId: string;
  title: string;
}>({
  open: false,
  mode: "month",
  transactionId: "",
  title: "",
});

const { data, refresh } = await useAsyncData(
  `customer-detail-${customerId}`,
  async () => {
    const [customerResult, transactionResult] = await Promise.all([
      supabase.from("customers").select("*").eq("id", customerId).single(),
      supabase
        .from("transactions")
        .select("*, transaction_lines(*)")
        .eq("customer_id", customerId)
        .is("deleted_at", null)
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
const transactions = computed<TransactionWithLines[]>(
  () => data.value?.transactions ?? [],
);
const filteredTransactions = computed(() => {
  const { year, month } = splitMonthValue(period.value);
  return transactions.value.filter((transaction) => {
    const date = new Date(transaction.tanggal);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });
});

function lineOmzet(transaction: TransactionWithLines, type?: "LM" | "BR") {
  return (transaction.transaction_lines ?? []).reduce((total, line) => {
    if (type && line.product_type !== type) return total;
    return total + toNumber(line.line_omzet);
  }, 0);
}

function lineProfit(transaction: TransactionWithLines) {
  return (transaction.transaction_lines ?? []).reduce(
    (total, line) => total + toNumber(line.line_laba_hl),
    0,
  );
}

function transactionAmount(transaction: TransactionWithLines) {
  return lineOmzet(transaction) + toNumber(transaction.ongkir);
}

const bonusAvailable = computed(() => {
  const threshold = toNumber(customer.value?.bonus_threshold);
  const paidOmzet = transactions.value
    .filter(
      (transaction) => transaction.status === "lunas" && !transaction.is_bonus,
    )
    .reduce((total, transaction) => total + lineOmzet(transaction), 0);

  return calcBonusesAvailable(
    paidOmzet,
    threshold,
    toNumber(customer.value?.bonuses_granted),
  );
});

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
  const totalOmzetLm = paidTransactions.reduce(
    (total, transaction) => total + lineOmzet(transaction, "LM"),
    0,
  );
  const totalOmzetBr = paidTransactions.reduce(
    (total, transaction) => total + lineOmzet(transaction, "BR"),
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
      label: "Omzet LM",
      value: formatRp(totalOmzetLm),
      helper: "Lunas, tanpa ongkir",
      icon: "lucide:chart-column",
    },
    {
      label: "Omzet BR",
      value: formatRp(totalOmzetBr),
      helper: "Lunas, tanpa ongkir",
      icon: "lucide:chart-column",
    },
    {
      label: "Omzet Total",
      value: formatRp(totalOmzetLm + totalOmzetBr),
      helper: "LM + BR",
      icon: "lucide:sigma",
    },
    {
      label: "Laba HL",
      value: formatRp(totalProfit),
      helper: "Internal",
      icon: "lucide:trending-up",
    },
  ];
});

function openSettleMonth() {
  settleDialog.open = true;
  settleDialog.mode = "month";
  settleDialog.transactionId = "";
  settleDialog.title = "Lunasi semua Bon bulan ini?";
}

function openSettleSingle(transactionId: string) {
  settleDialog.open = true;
  settleDialog.mode = "single";
  settleDialog.transactionId = transactionId;
  settleDialog.title = "Lunasi Bon ini?";
}

function closeSettleDialog() {
  settleDialog.open = false;
}

async function confirmSettle() {
  settling.value = true;

  if (settleDialog.mode === "month") {
    const { year, month } = splitMonthValue(period.value);
    const { data: count, error } = await supabase.rpc("settle_month", {
      p_customer_id: customerId,
      p_year: year,
      p_month: month,
      p_tanggal_lunas: settleDate.value,
    });

    settling.value = false;
    if (error) {
      toast.error("Bon bulan ini belum bisa dilunasi.");
      return;
    }

    toast.success(`${count ?? 0} bon berhasil dilunasi.`);
  } else {
    const { data: settled, error } = await supabase.rpc("settle_transaction", {
      p_transaction_id: settleDialog.transactionId,
      p_tanggal_lunas: settleDate.value,
    });

    settling.value = false;
    if (error || !settled) {
      toast.error("Bon belum bisa dilunasi.");
      return;
    }

    toast.success("Bon berhasil dilunasi.");
  }

  closeSettleDialog();
  await refresh();
}

function exportRows(rows: TransactionWithLines[], title: string) {
  const body = rows
    .map(
      (transaction) =>
        `<tr><td>${formatDate(transaction.tanggal)}</td><td>${transaction.nomor_bon}</td><td>${transaction.is_bonus ? "Bonus" : transaction.status}</td><td class="right">${formatRp(transactionAmount(transaction))}</td></tr>`,
    )
    .join("");

  exportHtml(
    title,
    `<p>${customer.value?.nama || "Pelanggan"} - ${period.value}</p><table><thead><tr><th>Tanggal</th><th>Nomor Bon</th><th>Status</th><th class="right">Tagihan</th></tr></thead><tbody>${body}</tbody></table>`,
    `HL-${filenamePart(title)}-${filenamePart(customer.value?.nama || "pelanggan")}-${period.value}.pdf`,
  );
}

function exportPiutang() {
  exportRows(
    filteredTransactions.value.filter(
      (transaction) =>
        transaction.status === "piutang" && !transaction.is_bonus,
    ),
    "HL - Piutang",
  );
}

function exportAll() {
  exportRows(filteredTransactions.value, "HL - Semua Bon");
}
</script>
