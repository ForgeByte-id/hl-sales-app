<template>
  <div class="min-h-screen overflow-x-clip bg-neutral-50 dark:bg-neutral-950">
    <div class="hidden md:fixed md:inset-y-0 md:left-0 md:block md:w-60">
      <AppSidebar @logout="handleLogout" />
    </div>

    <header
      class="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 md:hidden"
    >
      <div class="flex items-center justify-between">
        <NuxtLink to="/dashboard" class="flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-50">
          <span class="flex size-8 items-center justify-center rounded-md bg-brand-600 text-xs font-bold text-white">
            HL
          </span>
          <span>HL App</span>
        </NuxtLink>
        <AppIconButton icon="lucide:menu" label="Buka navigasi" @click="isMenuOpen = true" />
      </div>
    </header>

    <div v-if="isMenuOpen" class="fixed inset-0 z-40 md:hidden">
      <button class="absolute inset-0 bg-neutral-950/40" type="button" aria-label="Tutup navigasi" @click="isMenuOpen = false" />
      <div class="relative h-full w-72 max-w-[85vw]">
        <AppSidebar @logout="handleLogout" />
      </div>
    </div>

    <main class="md:pl-60">
      <div class="app-container py-5 sm:py-6">
        <div class="rounded-[1.25rem] bg-white/35 p-1 dark:bg-neutral-900/20 md:bg-transparent md:p-0">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const isMenuOpen = ref(false)
const supabase = useSupabaseClient()

async function handleLogout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>
