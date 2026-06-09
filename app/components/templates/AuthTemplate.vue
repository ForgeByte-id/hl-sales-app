<template>
  <main class="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8 dark:bg-neutral-950">
    <section class="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-5 shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
      <div class="mb-5">
        <div class="flex size-10 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
          HL
        </div>
        <h1 class="mt-4 text-xl font-semibold leading-7 text-neutral-900 dark:text-neutral-50">
          Masuk ke HL App
        </h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Gunakan akun yang sudah dibuat di Supabase. Tidak ada registrasi mandiri.
        </p>
      </div>

      <slot />
    </section>
  </main>
</template>
