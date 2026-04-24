<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    action?: string
    disabled?: boolean
  }>(),
  { label: '', action: '', disabled: false },
)

const emit = defineEmits<{ (e: 'action', name: string): void }>()

function onClick(event: MouseEvent) {
  const target = event.currentTarget as HTMLButtonElement | null
  const name = target?.dataset.action ?? ''
  emit('action', name)
}
</script>

<template>
  <button
    type="button"
    class="agentui-button"
    :data-action="action"
    :disabled="disabled"
    @click="onClick"
  >
    {{ label }}
  </button>
</template>
