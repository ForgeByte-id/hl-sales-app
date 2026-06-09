<template>
  <label class="block">
    <span
      class="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
    >
      {{ label }}
    </span>
    <span
      class="flex h-10 items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-neutral-900 shadow-soft transition focus-within:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
    >
      <Icon
        v-if="icon"
        :name="icon"
        class="size-4 text-neutral-400"
        aria-hidden="true"
      />
      <input
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        class="min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-400"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
      />
    </span>
    <span
      v-if="helper"
      class="mt-1 block text-xs leading-5 text-neutral-500 dark:text-neutral-400"
    >
      {{ helper }}
    </span>
  </label>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    placeholder?: string;
    helper?: string;
    icon?: string;
    type?: string;
  }>(),
  {
    placeholder: "",
    helper: "",
    icon: "",
    type: "text",
  },
);

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>
