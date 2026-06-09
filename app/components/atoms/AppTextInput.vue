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
        :min="min"
        :autocomplete="autocomplete"
        class="min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-400"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
        @blur="$emit('blur')"
      />
    </span>
    <span
      v-if="error"
      class="mt-1 block text-xs leading-5 text-danger-text dark:text-danger-darkText"
    >
      {{ error }}
    </span>
    <span
      v-else-if="helper"
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
    error?: string;
    icon?: string;
    type?: string;
    min?: string | number;
    autocomplete?: string;
  }>(),
  {
    placeholder: "",
    helper: "",
    error: "",
    icon: "",
    type: "text",
    min: undefined,
    autocomplete: undefined,
  },
);

defineEmits<{
  "update:modelValue": [value: string];
  blur: [];
}>();
</script>
