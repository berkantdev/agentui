<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    modelValue?: string
    disabled?: boolean
  }>(),
  { label: '', placeholder: '', modelValue: '', disabled: false },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <label class="sb-shadcn-input">
    <span
      v-if="label"
      class="sb-shadcn-input__label"
    >{{ label }}</span>
    <input
      class="sb-shadcn-input__control"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
    >
  </label>
</template>

<style>
.sb-shadcn-input {
  display: grid;
  gap: 0.25rem;
}
.sb-shadcn-input__label {
  font-size: 0.85rem;
  color: var(--sb-muted);
}
.sb-shadcn-input__control {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--sb-border);
  border-radius: 0.5rem;
  background: var(--sb-bg);
  color: var(--sb-fg);
  font: inherit;
}
.sb-shadcn-input__control:focus {
  outline: 2px solid var(--sb-accent);
  outline-offset: 1px;
}
.sb-shadcn-input__control:disabled {
  opacity: 0.5;
}
</style>
