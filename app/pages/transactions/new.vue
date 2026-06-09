<template>
  <AppShell>
    <TransactionForm
      title="Buat Bon"
      submit-label="Simpan Bon"
      :customers="customers"
      :products="products"
      :discount-steps="discountSteps"
      :initial="initial"
      @submit="createTransaction"
    />
  </AppShell>
</template>

<script setup lang="ts">
import type { Database, Json } from "~~/types/database.types";

definePageMeta({ middleware: ["auth"] });

const supabase = useSupabaseClient<Database>();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const { data } = await useAsyncData("transaction-form-master", async () => {
  const [customersResult, productsResult, stepsResult] = await Promise.all([
    supabase.from("customers").select("*").is("deleted_at", null).order("nama"),
    supabase.from("products").select("*").is("deleted_at", null).order("nama"),
    supabase.from("discount_steps").select("*").order("step_order"),
  ]);

  if (customersResult.error) throw customersResult.error;
  if (productsResult.error) throw productsResult.error;
  if (stepsResult.error) throw stepsResult.error;

  return {
    customers: customersResult.data ?? [],
    products: productsResult.data ?? [],
    discountSteps: stepsResult.data ?? [],
  };
});

const customers = computed(() => data.value?.customers ?? []);
const products = computed(() => data.value?.products ?? []);
const discountSteps = computed(() => data.value?.discountSteps ?? []);
const initial = computed(() => ({
  nomor_bon: "",
  tanggal: todayInputValue(),
  customer_id:
    typeof route.query.customer === "string" ? route.query.customer : "",
  ongkir: 0,
  deskripsi: "",
  is_bonus: route.query.bonus === "1",
  status: "piutang",
  lines: [{ product_id: "", qty: 1 }],
}));

async function createTransaction(payload: {
  transaction: Database["public"]["Tables"]["transactions"]["Insert"];
  lines: Array<
    Omit<
      Database["public"]["Tables"]["transaction_lines"]["Insert"],
      "transaction_id"
    >
  >;
  bonus_units: number;
}) {
  const { data: transactionId, error } = await supabase.rpc(
    "save_transaction",
    {
      p_transaction_id: null,
      p_nomor_bon: payload.transaction.nomor_bon,
      p_tanggal: payload.transaction.tanggal ?? todayInputValue(),
      p_customer_id: payload.transaction.customer_id,
      p_ongkir: payload.transaction.ongkir ?? 0,
      p_deskripsi: payload.transaction.deskripsi ?? null,
      p_is_bonus: payload.transaction.is_bonus ?? false,
      p_status: payload.transaction.status ?? "piutang",
      p_tanggal_lunas: payload.transaction.tanggal_lunas ?? null,
      p_bonus_units: payload.bonus_units,
      p_lines: payload.lines as unknown as Json,
    },
  );

  if (error || !transactionId) {
    toast.error(friendlySupabaseError(error?.message));
    return;
  }

  toast.success("Bon disimpan.");
  await router.push(`/transactions/${transactionId}`);
}
</script>
