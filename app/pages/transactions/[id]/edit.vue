<template>
  <AppShell>
    <TransactionForm
      v-if="initial"
      title="Edit Bon"
      submit-label="Simpan"
      :transaction-id="transactionId"
      :customers="customers"
      :products="products"
      :discount-steps="discountSteps"
      :initial="initial"
      @submit="updateTransaction"
    />
  </AppShell>
</template>

<script setup lang="ts">
import type { Database, Json } from "~~/types/database.types";

definePageMeta({ middleware: ["auth"] });

const supabase = useSupabaseClient<Database>();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const transactionId = String(route.params.id);

const { data } = await useAsyncData(
  `transaction-edit-${transactionId}`,
  async () => {
    const [transactionResult, customersResult, productsResult, stepsResult] =
      await Promise.all([
        supabase
          .from("transactions")
          .select("*, transaction_lines(*)")
          .eq("id", transactionId)
          .single(),
        supabase
          .from("customers")
          .select("*")
          .is("deleted_at", null)
          .order("nama"),
        supabase
          .from("products")
          .select("*")
          .is("deleted_at", null)
          .order("nama"),
        supabase.from("discount_steps").select("*").order("step_order"),
      ]);

    if (transactionResult.error) throw transactionResult.error;
    if (customersResult.error) throw customersResult.error;
    if (productsResult.error) throw productsResult.error;
    if (stepsResult.error) throw stepsResult.error;

    return {
      transaction: transactionResult.data,
      customers: customersResult.data ?? [],
      products: productsResult.data ?? [],
      discountSteps: stepsResult.data ?? [],
    };
  },
);

const customers = computed(() => data.value?.customers ?? []);
const products = computed(() => data.value?.products ?? []);
const discountSteps = computed(() => data.value?.discountSteps ?? []);
const initial = computed(() => {
  const transaction = data.value?.transaction;
  if (!transaction) return null;

  return {
    nomor_bon: transaction.nomor_bon,
    tanggal: transaction.tanggal,
    customer_id: transaction.customer_id,
    ongkir: transaction.ongkir,
    deskripsi: transaction.deskripsi,
    is_bonus: transaction.is_bonus,
    status: transaction.status,
    lines: (transaction.transaction_lines ?? []).map((line) => ({
      product_id: line.product_id,
      qty: line.qty,
    })),
  };
});

async function updateTransaction(payload: {
  transaction: Database["public"]["Tables"]["transactions"]["Update"];
  lines: Array<
    Omit<
      Database["public"]["Tables"]["transaction_lines"]["Insert"],
      "transaction_id"
    >
  >;
  bonus_units: number;
}) {
  const { data: savedId, error } = await supabase.rpc("save_transaction", {
    p_transaction_id: transactionId,
    p_nomor_bon: payload.transaction.nomor_bon ?? "",
    p_tanggal: payload.transaction.tanggal ?? todayInputValue(),
    p_customer_id: payload.transaction.customer_id ?? "",
    p_ongkir: payload.transaction.ongkir ?? 0,
    p_deskripsi: payload.transaction.deskripsi ?? null,
    p_is_bonus: payload.transaction.is_bonus ?? false,
    p_status: payload.transaction.status ?? "piutang",
    p_tanggal_lunas: payload.transaction.tanggal_lunas ?? null,
    p_bonus_units: payload.bonus_units,
    p_lines: payload.lines as unknown as Json,
  });

  if (error) {
    toast.error(friendlySupabaseError(error.message));
    return;
  }

  toast.success("Bon diperbarui.");
  await router.push(`/transactions/${savedId ?? transactionId}`);
}
</script>
