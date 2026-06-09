<template>
  <Teleport to="body">
    <div
      v-if="state.open"
      class="fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/40 p-4 sm:items-center"
      role="presentation"
    >
      <section
        class="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-md"
            :class="
              state.tone === 'danger'
                ? 'bg-red-50 text-danger-text dark:bg-red-950 dark:text-danger-darkText'
                : 'bg-brand-50 text-brand-700 dark:bg-neutral-800 dark:text-brand-100'
            "
          >
            <Icon
              :name="
                state.tone === 'danger'
                  ? 'lucide:triangle-alert'
                  : 'lucide:help-circle'
              "
              class="size-4"
              aria-hidden="true"
            />
          </div>
          <div class="min-w-0">
            <h2
              :id="titleId"
              class="text-base font-semibold text-neutral-900 dark:text-neutral-50"
            >
              {{ state.title }}
            </h2>
            <p
              :id="descriptionId"
              class="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400"
            >
              {{ state.description }}
            </p>
          </div>
        </div>

        <div
          class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
        >
          <AppButton variant="secondary" @click="resolve(false)">{{
            state.cancelLabel
          }}</AppButton>
          <AppButton
            :variant="state.tone === 'danger' ? 'danger' : 'primary'"
            @click="resolve(true)"
          >
            {{ state.confirmLabel }}
          </AppButton>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { state, resolve } = useConfirm();
const titleId = "hl-confirm-title";
const descriptionId = "hl-confirm-description";
</script>
