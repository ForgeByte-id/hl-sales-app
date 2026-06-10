import type { DashboardData } from "~/types/dashboard";
import type { Database } from "~~/types/database.types";

type TransactionRecord = {
  id: string;
  nomor_bon: string;
  tanggal: string;
  ongkir: number | string;
  status: "piutang" | "lunas";
  is_bonus: boolean;
  customer_id: string;
  transaction_lines?: Array<{
    line_omzet: number | string;
  }>;
};

type CustomerRecord = {
  id: string;
  nama: string;
  bonus_threshold: number | string;
  bonuses_granted: number | string;
};

const emptyDashboard: DashboardData = {
  isConfigured: true,
  metrics: [
    {
      label: "Total Piutang",
      value: formatRp(0),
      helper: "Belum ada bon piutang",
      icon: "lucide:wallet",
    },
    {
      label: "Omzet Bulan Ini",
      value: formatRp(0),
      helper: "Dihitung dari bon lunas",
      icon: "lucide:chart-column",
    },
    {
      label: "Pelanggan Piutang",
      value: "0",
      helper: "Tidak ada yang perlu ditagih",
      icon: "lucide:users",
    },
    {
      label: "Bonus Tersedia",
      value: "0",
      helper: "Belum ada bonus aktif",
      icon: "lucide:gift",
    },
  ],
  urgentReceivables: [],
  bonusCustomers: [],
  setupMessage: null,
};

function numberFrom(value: number | string | null | undefined): number {
  return Number(value ?? 0);
}

function lineTotal(transaction: TransactionRecord): number {
  return (transaction.transaction_lines ?? []).reduce(
    (total, line) => total + numberFrom(line.line_omzet),
    0,
  );
}

function isCurrentMonth(date: string): boolean {
  const current = new Date();
  const value = new Date(date);

  return (
    value.getFullYear() === current.getFullYear() &&
    value.getMonth() === current.getMonth()
  );
}

function isOverdue(date: string): boolean {
  const value = new Date(date).getTime();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  return Number.isFinite(value) && Date.now() - value > thirtyDays;
}

export function useDashboardData() {
  const config = useRuntimeConfig();

  return useAsyncData<DashboardData>("dashboard-data", async () => {
    const supabaseConfig = config.public.supabase;

    if (!supabaseConfig?.url || !supabaseConfig?.key) {
      return {
        ...emptyDashboard,
        isConfigured: false,
        setupMessage:
          "Koneksi data belum siap, jadi ringkasan usaha belum bisa ditampilkan.",
      };
    }

    const supabase = useSupabaseClient<Database>();

    const [transactionsResult, customersResult] = await Promise.all([
      supabase
        .from("transactions")
        .select(
          "id, nomor_bon, tanggal, ongkir, status, is_bonus, customer_id, transaction_lines(line_omzet)",
        )
        .is("deleted_at", null)
        .order("tanggal", { ascending: false })
        .limit(100),
      supabase
        .from("customers")
        .select("id, nama, bonus_threshold, bonuses_granted")
        .is("deleted_at", null)
        .order("nama", { ascending: true }),
    ]);

    if (transactionsResult.error || customersResult.error) {
      const message =
        transactionsResult.error?.message ||
        customersResult.error?.message ||
        "Data usaha belum bisa dibaca.";

      return {
        ...emptyDashboard,
        setupMessage: message,
      };
    }

    const transactions = (transactionsResult.data ??
      []) as unknown as TransactionRecord[];
    const customers = (customersResult.data ??
      []) as unknown as CustomerRecord[];
    const customerNames = new Map(
      customers.map((customer) => [customer.id, customer.nama]),
    );

    const piutangTransactions = transactions.filter(
      (transaction) =>
        transaction.status === "piutang" && !transaction.is_bonus,
    );
    const overdueTransactions = piutangTransactions.filter((transaction) =>
      isOverdue(transaction.tanggal),
    );
    const lunasThisMonth = transactions.filter(
      (transaction) =>
        transaction.status === "lunas" &&
        !transaction.is_bonus &&
        isCurrentMonth(transaction.tanggal),
    );
    const totalPiutang = piutangTransactions.reduce(
      (total, transaction) =>
        total + lineTotal(transaction) + numberFrom(transaction.ongkir),
      0,
    );
    const totalOmzetThisMonth = lunasThisMonth.reduce(
      (total, transaction) => total + lineTotal(transaction),
      0,
    );
    const paidOmzetByCustomer = transactions
      .filter(
        (transaction) =>
          transaction.status === "lunas" && !transaction.is_bonus,
      )
      .reduce((map, transaction) => {
        map.set(
          transaction.customer_id,
          (map.get(transaction.customer_id) ?? 0) + lineTotal(transaction),
        );
        return map;
      }, new Map<string, number>());

    const bonusCustomers = customers
      .map((customer) => {
        const threshold = numberFrom(customer.bonus_threshold);
        const available = calcBonusesAvailable(
          paidOmzetByCustomer.get(customer.id) ?? 0,
          threshold,
          numberFrom(customer.bonuses_granted),
        );

        return { customer, available };
      })
      .filter((item) => item.available > 0);

    return {
      isConfigured: true,
      metrics: [
        {
          label: "Total Piutang",
          value: formatRp(totalPiutang),
          helper: `${piutangTransactions.length} bon belum lunas`,
          icon: "lucide:wallet",
        },
        {
          label: "Omzet Bulan Ini",
          value: formatRp(totalOmzetThisMonth),
          helper: "Hanya dari bon lunas",
          icon: "lucide:chart-column",
        },
        {
          label: "Piutang Lama",
          value: String(overdueTransactions.length),
          helper: "Bon lewat 30 hari",
          icon: "lucide:users",
        },
        {
          label: "Bonus Tersedia",
          value: String(bonusCustomers.length),
          helper: "Pelanggan dengan bonus aktif",
          icon: "lucide:gift",
        },
      ],
      urgentReceivables: overdueTransactions.slice(0, 5).map((transaction) => ({
        id: transaction.id,
        title: transaction.nomor_bon,
        meta: `${customerNames.get(transaction.customer_id) ?? "Pelanggan"} - ${formatDate(transaction.tanggal)}`,
        amount: formatRp(
          lineTotal(transaction) + numberFrom(transaction.ongkir),
        ),
        status: "piutang",
      })),
      bonusCustomers: bonusCustomers
        .slice(0, 5)
        .map(({ customer, available }) => ({
          id: customer.id,
          title: customer.nama,
          meta: `${available} bonus tersedia`,
          amount: formatRp(paidOmzetByCustomer.get(customer.id) ?? 0),
          status: "bonus",
        })),
      setupMessage: null,
    };
  });
}
