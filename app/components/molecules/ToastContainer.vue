<template>
  <div
    class="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
    aria-live="polite"
    aria-atomic="true"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="rounded-md border bg-white p-3 shadow-lg dark:bg-neutral-900"
      :class="toneClasses[toast.tone]"
      role="status"
    >
      <div class="flex gap-3">
        <Icon
          :name="toneIcons[toast.tone]"
          class="mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-neutral-900 dark:text-neutral-50">
            {{ toast.title }}
          </p>
          <p
            v-if="toast.description"
            class="mt-0.5 text-xs leading-5 text-neutral-500 dark:text-neutral-400"
          >
            {{ toast.description }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          aria-label="Tutup pesan"
          @click="removeToast(toast.id)"
        >
          <Icon name="lucide:x" class="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { toasts, removeToast } = useToast();

const toneClasses = {
  success: "border-lunas-dot/40",
  error: "border-danger/40",
  info: "border-brand-500/40",
};

const toneIcons = {
  success: "lucide:check-circle-2",
  error: "lucide:circle-alert",
  info: "lucide:info",
};
</script>
