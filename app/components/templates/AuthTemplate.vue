<template>
  <main class="min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top_left,#e0f2fe_0,#f8fafc_34%,#f1f5f9_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top_left,#0f172a_0,#020617_42%,#020617_100%)]">
    <div class="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section class="hidden lg:block">
        <div class="max-w-xl">
          <h1 class="text-4xl font-semibold leading-tight text-neutral-950 dark:text-neutral-50">
            Catatan penjualan yang terasa tenang, jelas, dan siap dipakai setiap hari.
          </h1>
          <p class="mt-4 max-w-lg text-base leading-7 text-neutral-600 dark:text-neutral-300">
            Masuk, cek piutang, buat bon, lalu lanjut kerja tanpa layar yang rumit.
          </p>
          <div class="mt-8 grid max-w-lg grid-cols-3 gap-3">
            <div class="rounded-lg border border-white/70 bg-white/75 p-3 shadow-soft dark:border-neutral-800 dark:bg-neutral-900/75">
              <p class="text-xs text-neutral-500 dark:text-neutral-400">Fokus</p>
              <p class="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Bon</p>
            </div>
            <div class="rounded-lg border border-white/70 bg-white/75 p-3 shadow-soft dark:border-neutral-800 dark:bg-neutral-900/75">
              <p class="text-xs text-neutral-500 dark:text-neutral-400">Pantau</p>
              <p class="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Piutang</p>
            </div>
            <div class="rounded-lg border border-white/70 bg-white/75 p-3 shadow-soft dark:border-neutral-800 dark:bg-neutral-900/75">
              <p class="text-xs text-neutral-500 dark:text-neutral-400">Ingatkan</p>
              <p class="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Bonus</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto w-full max-w-md rounded-xl border border-white/70 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/92">
        <div class="mb-5">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-lg bg-neutral-950 text-sm font-bold text-white shadow-soft dark:bg-brand-600">
              HL
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Area Masuk</p>
              <h1 class="text-xl font-semibold leading-7 text-neutral-900 dark:text-neutral-50">
                Masuk ke HL App
              </h1>
            </div>
          </div>
          <p class="mt-4 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
            Masukkan email dan password untuk membuka dashboard usaha.
          </p>
        </div>

        <slot />
      </section>
    </div>
  </main>
</template>
