<template>
  <AuthTemplate>
    <form class="space-y-4" @submit.prevent="handleLogin">
      <AppTextInput
        v-model="email"
        label="Email"
        type="email"
        icon="lucide:mail"
        placeholder="nama@email.com"
      />

      <label class="block">
        <span
          class="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
        >
          Password
        </span>

        <span
          class="flex h-10 items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-neutral-900 shadow-soft transition focus-within:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
        >
          <Icon
            name="lucide:lock"
            class="size-4 text-neutral-400"
            aria-hidden="true"
          />

          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Masukkan password"
            class="min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-400"
            autocomplete="current-password"
          />

          <button
            type="button"
            class="inline-flex size-7 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            :aria-label="
              showPassword ? 'Sembunyikan password' : 'Tampilkan password'
            "
            :title="
              showPassword ? 'Sembunyikan password' : 'Tampilkan password'
            "
            @click="showPassword = !showPassword"
          >
            <Icon
              :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
              class="size-4"
              aria-hidden="true"
            />
          </button>
        </span>
      </label>

      <label
        class="flex items-start gap-3 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 shadow-soft dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
      >
        <input
          v-model="rememberMe"
          type="checkbox"
          class="mt-1 size-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-700"
        />
        <span>
          <span class="block font-medium">Ingat email saya</span>
          <span class="block text-xs text-neutral-500 dark:text-neutral-400">
            Simpan sesi login selama 7 hari di perangkat ini.
          </span>
        </span>
      </label>

      <p
        v-if="message"
        class="rounded-md bg-red-50 px-3 py-2 text-sm text-danger-text dark:bg-red-950 dark:text-danger-darkText"
      >
        {{ message }}
      </p>

      <AppButton
        class="w-full"
        type="submit"
        icon="lucide:log-in"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? "Memproses..." : "Masuk" }}
      </AppButton>
    </form>
  </AuthTemplate>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["guest"],
});

const REMEMBER_EMAIL_KEY = "hl_remember_email";
const REMEMBER_UNTIL_KEY = "hl_remember_until";
const REMEMBER_DAYS = 7;

const supabase = useSupabaseClient();
const email = ref("");
const password = ref("");
const message = ref("");
const isSubmitting = ref(false);
const showPassword = ref(false);
const rememberMe = ref(false);

onMounted(() => {
  const rememberedUntil = Number(localStorage.getItem(REMEMBER_UNTIL_KEY) || 0);
  const rememberedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY) || "";

  if (rememberedUntil > Date.now() && rememberedEmail) {
    email.value = rememberedEmail;
    rememberMe.value = true;
    return;
  }

  localStorage.removeItem(REMEMBER_EMAIL_KEY);
  localStorage.removeItem(REMEMBER_UNTIL_KEY);
});

function rememberLoginEmail() {
  if (!rememberMe.value) {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
    localStorage.removeItem(REMEMBER_UNTIL_KEY);
    return;
  }

  const rememberUntil = Date.now() + REMEMBER_DAYS * 24 * 60 * 60 * 1000;

  localStorage.setItem(REMEMBER_EMAIL_KEY, email.value.trim());
  localStorage.setItem(REMEMBER_UNTIL_KEY, String(rememberUntil));
}

async function handleLogin() {
  message.value = "";

  if (!email.value.trim() || !password.value) {
    message.value = "Email dan password wajib diisi.";
    return;
  }

  isSubmitting.value = true;

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value,
  });

  isSubmitting.value = false;

  if (error) {
    message.value = "Email atau password salah.";
    return;
  }

  rememberLoginEmail();

  await navigateTo("/dashboard");
}
</script>
