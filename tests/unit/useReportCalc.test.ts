import { describe, expect, it } from "vitest";

import {
  filterTransactionsByMonth,
  getBonusTransactions,
  summarizeTransactions,
  transactionAmount,
} from "../../app/composables/useReportCalc";

const transactions = [
  {
    id: "lunas-1",
    nomor_bon: "BON-001",
    tanggal: "2026-06-03",
    ongkir: 10000,
    status: "lunas",
    is_bonus: false,
    transaction_lines: [
      { product_type: "LM", line_omzet: 100000, line_laba_hl: 25000 },
      { product_type: "BR", line_omzet: 50000, line_laba_hl: 12000 },
    ],
  },
  {
    id: "piutang-1",
    nomor_bon: "BON-002",
    tanggal: "2026-06-11",
    ongkir: 5000,
    status: "piutang",
    is_bonus: false,
    transaction_lines: [
      { product_type: "LM", line_omzet: 80000, line_laba_hl: 20000 },
    ],
  },
  {
    id: "bonus-1",
    nomor_bon: "BONUS-001",
    tanggal: "2026-06-12",
    ongkir: 0,
    status: "lunas",
    is_bonus: true,
    bonus_units: 2,
    transaction_lines: [{ product_type: "LM", line_omzet: 0, line_laba_hl: 0 }],
  },
  {
    id: "other-month",
    nomor_bon: "BON-003",
    tanggal: "2026-05-30",
    ongkir: 0,
    status: "lunas",
    is_bonus: false,
    transaction_lines: [
      { product_type: "BR", line_omzet: 999999, line_laba_hl: 999999 },
    ],
  },
];

describe("report calculation", () => {
  it("filters transactions by month", () => {
    expect(
      filterTransactionsByMonth(transactions, "2026-06").map((item) => item.id),
    ).toEqual(["lunas-1", "piutang-1", "bonus-1"]);
  });

  it("summarizes cash-basis reports and keeps ongkir out of omzet and laba", () => {
    const summary = summarizeTransactions(
      filterTransactionsByMonth(transactions, "2026-06"),
    );

    expect(summary).toEqual({
      omzet: 150000,
      laba: 37000,
      piutang: 85000,
      paid: 160000,
      omzetLm: 100000,
      omzetBr: 50000,
    });
  });

  it("summarizes per-type reports without assigning ongkir to a product type", () => {
    const summary = summarizeTransactions(
      filterTransactionsByMonth(transactions, "2026-06"),
      "LM",
    );

    expect(summary).toMatchObject({
      omzet: 100000,
      laba: 25000,
      piutang: 80000,
      paid: 100000,
    });
  });

  it("keeps bonus Bon separate from revenue totals", () => {
    const filtered = filterTransactionsByMonth(transactions, "2026-06");

    expect(
      getBonusTransactions(filtered).map((item) => item.nomor_bon),
    ).toEqual(["BONUS-001"]);
    expect(transactionAmount(filtered[0])).toBe(160000);
  });
});
