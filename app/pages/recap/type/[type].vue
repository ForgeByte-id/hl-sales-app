<template>
  <AppShell>
    <div class="space-y-5">
      <PageHeader
        :title="`Rekap ${type}`"
        description="Ringkasan berdasarkan tipe produk."
        eyebrow="Laporan"
      >
        <template #actions>
          <AppButton to="/recap" variant="secondary" icon="lucide:arrow-left"
            >Kembali</AppButton
          >
          <AppButton icon="lucide:printer" @click="exportReport">PDF</AppButton>
        </template>
      </PageHeader>

      <SectionPanel title="Periode">
        <AppTextInput v-model="period" label="Bulan" type="month" />
      </SectionPanel>

      <DashboardSummaryGrid :metrics="summaryCards" />

      <SectionPanel title="Bon Bonus">
        <EmptyState
          v-if="bonusTransactions.length === 0"
          title="Belum ada Bon Bonus"
          description="Bon Bonus pada periode ini akan muncul di sini."
          icon="lucide:gift"
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
                <th class="px-3 py-2 text-right">Jumlah Bonus</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
              <tr
                v-for="transaction in bonusTransactions"
                :key="transaction.id"
              >
                <td class="px-3 py-3">{{ formatDate(transaction.tanggal) }}</td>
                <td class="px-3 py-3 font-medium">
                  {{ transaction.nomor_bon }}
                </td>
                <td class="px-3 py-3 text-right font-mono">
                  {{ transaction.bonus_units }}
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
import type { ReportProductType } from "~/composables/useReportCalc";

definePageMeta({ middleware: ["auth"] });

const supabase = useSupabaseClient<Database>();
const route = useRoute();
const { exportHtml } = usePdfExport();
const type = computed<ReportProductType>(() =>
  String(route.params.type).toUpperCase() === "BR" ? "BR" : "LM",
);
const period = ref(currentMonthValue());

const { data: transactions } = await useAsyncData(
  `recap-type-${type.value}`,
  async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*, transaction_lines(*)")
      .is("deleted_at", null)
      .order("tanggal", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
);

const filtered = computed(() =>
  filterTransactionsByMonth(transactions.value ?? [], period.value),
);
const bonusTransactions = computed(() => getBonusTransactions(filtered.value));
const summary = computed(() =>
  summarizeTransactions(filtered.value, type.value),
);

const summaryCards = computed(() => [
  {
    label: "Omzet Lunas",
    value: formatRp(summary.value.omzet),
    helper: type.value,
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
    helper: "Omzet produk",
    icon: "lucide:badge-check",
  },
]);

function exportReport() {
  const bonusRows = bonusTransactions.value
    .map(
      (transaction) =>
        `<tr><td>${formatDate(transaction.tanggal)}</td><td>${transaction.nomor_bon}</td><td class="right">${transaction.bonus_units}</td></tr>`,
    )
    .join("");

  exportHtml(
    `HL - Rekap ${type.value}`,
    `<p>Periode ${period.value}</p><table><tbody><tr><th>Omzet Lunas</th><td class="right">${formatRp(summary.value.omzet)}</td></tr><tr><th>Laba HL</th><td class="right">${formatRp(summary.value.laba)}</td></tr><tr><th>Piutang</th><td class="right">${formatRp(summary.value.piutang)}</td></tr><tr><th>Sudah Dibayar</th><td class="right">${formatRp(summary.value.paid)}</td></tr></tbody></table><h2>Bon Bonus</h2><table><thead><tr><th>Tanggal</th><th>Nomor Bon</th><th class="right">Jumlah Bonus</th></tr></thead><tbody>${bonusRows || '<tr><td colspan="3">Belum ada Bon Bonus</td></tr>'}</tbody></table>`,
    `HL-rekap-${type.value.toLowerCase()}-${period.value}.pdf`,
  );
}
</script>
