<template>
  <label class="block">
    <span
      class="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
    >
      {{ label }}
    </span>
    <select
      :value="modelValue"
      class="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 shadow-soft transition focus:border-brand-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
      @change="
        $emit('update:modelValue', ($event.target as HTMLSelectElement).value)
      "
    >
      <option value="">{{ placeholder }}</option>
      <option
        v-for="option in filteredOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <input
      v-model="keyword"
      type="search"
      class="mt-2 h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
      :placeholder="searchPlaceholder"
    />
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
const props = withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    placeholder: string;
    searchPlaceholder?: string;
    helper?: string;
    error?: string;
    options: Array<{ value: string; label: string }>;
  }>(),
  {
    searchPlaceholder: "Cari...",
    helper: "",
    error: "",
  },
);

defineEmits<{
  "update:modelValue": [value: string];
}>();

const keyword = ref("");

const filteredOptions = computed(() => {
  const value = keyword.value.trim().toLowerCase();
  if (!value) return props.options;

  return props.options.filter((option) =>
    option.label.toLowerCase().includes(value),
  );
});
</script>
