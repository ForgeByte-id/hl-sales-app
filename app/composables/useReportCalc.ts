import { splitMonthValue, toNumber } from "../utils/number";

export type ReportProductType = "LM" | "BR";
export type ReportStatus = "piutang" | "lunas";

export interface ReportLine {
  product_type: string;
  line_omzet: number | string;
  line_laba_hl: number | string;
}

export interface ReportTransaction {
  id: string;
  nomor_bon: string;
  tanggal: string;
  ongkir: number | string;
  status: string;
  is_bonus: boolean;
  bonus_units?: number | string | null;
  transaction_lines?: ReportLine[];
}

export interface ReportSummary {
  omzet: number;
  laba: number;
  piutang: number;
  paid: number;
  omzetLm: number;
  omzetBr: number;
}

export function filterTransactionsByMonth<T extends ReportTransaction>(
  transactions: T[],
  period: string,
): T[] {
  const { year, month } = splitMonthValue(period);

  return transactions.filter((transaction) => {
    const date = new Date(transaction.tanggal);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });
}

export function lineOmzet(
  transaction: ReportTransaction,
  type?: ReportProductType,
): number {
  return (transaction.transaction_lines ?? []).reduce((total, line) => {
    if (type && line.product_type !== type) return total;
    return total + toNumber(line.line_omzet);
  }, 0);
}

export function lineProfit(
  transaction: ReportTransaction,
  type?: ReportProductType,
): number {
  return (transaction.transaction_lines ?? []).reduce((total, line) => {
    if (type && line.product_type !== type) return total;
    return total + toNumber(line.line_laba_hl);
  }, 0);
}

export function transactionAmount(transaction: ReportTransaction): number {
  return lineOmzet(transaction) + toNumber(transaction.ongkir);
}

export function summarizeTransactions(
  transactions: ReportTransaction[],
  type?: ReportProductType,
): ReportSummary {
  return transactions.reduce<ReportSummary>(
    (summary, transaction) => {
      if (transaction.is_bonus) return summary;

      const omzet = lineOmzet(transaction, type);
      const laba = lineProfit(transaction, type);
      const paidAmount = type ? omzet : omzet + toNumber(transaction.ongkir);

      if (transaction.status === "lunas") {
        summary.omzet += omzet;
        summary.laba += laba;
        summary.paid += paidAmount;
        summary.omzetLm += lineOmzet(transaction, "LM");
        summary.omzetBr += lineOmzet(transaction, "BR");
      }

      if (transaction.status === "piutang") {
        summary.piutang += paidAmount;
      }

      return summary;
    },
    {
      omzet: 0,
      laba: 0,
      piutang: 0,
      paid: 0,
      omzetLm: 0,
      omzetBr: 0,
    },
  );
}

export function getBonusTransactions<T extends ReportTransaction>(
  transactions: T[],
): T[] {
  return transactions.filter((transaction) => transaction.is_bonus);
}
