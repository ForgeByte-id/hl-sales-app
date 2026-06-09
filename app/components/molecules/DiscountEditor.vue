<template>
  <div class="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
    <div class="mb-3 flex items-center justify-between gap-3">
      <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{{ title }}</h3>
      <AppButton size="sm" variant="secondary" icon="lucide:plus" @click="addStep">Tambah</AppButton>
    </div>

    <div v-if="modelValue.length === 0" class="rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">
      Tanpa diskon.
    </div>
    <div v-else class="space-y-2">
      <div v-for="(_, index) in modelValue" :key="index" class="grid grid-cols-[1fr_auto_auto_auto] items-end gap-2">
        <AppTextInput
          :model-value="modelValue[index]"
          :label="`Step ${index + 1}`"
          placeholder="0"
          type="number"
          @update:model-value="updateStep(index, $event)"
        />
        <AppIconButton icon="lucide:arrow-up" label="Naik" :disabled="index === 0" @click="moveStep(index, -1)" />
        <AppIconButton icon="lucide:arrow-down" label="Turun" :disabled="index === modelValue.length - 1" @click="moveStep(index, 1)" />
        <AppIconButton icon="lucide:trash" label="Hapus" @click="removeStep(index)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
  title: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

function addStep() {
  emit('update:modelValue', [...props.modelValue, ''])
}

function updateStep(index: number, value: string) {
  const next = [...props.modelValue]
  next[index] = value
  emit('update:modelValue', next)
}

function removeStep(index: number) {
  emit('update:modelValue', props.modelValue.filter((_, itemIndex) => itemIndex !== index))
}

function moveStep(index: number, direction: -1 | 1) {
  const next = [...props.modelValue]
  const target = index + direction
  const current = next[index]
  next[index] = next[target]
  next[target] = current
  emit('update:modelValue', next)
}
</script>
