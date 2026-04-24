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
  <label class="agentui-textfield">
    <span v-if="label" class="agentui-textfield__label">{{ label }}</span>
    <input
      type="text"
      class="agentui-textfield__input"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
    />
  </label>
</template>
