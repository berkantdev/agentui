<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    title?: string
    triggerLabel?: string
  }>(),
  { title: 'Dialog', triggerLabel: 'Open' },
)

const open = ref(false)
</script>

<template>
  <div class="sb-shadcn-dialog">
    <button
      type="button"
      class="sb-shadcn-button sb-shadcn-button--outline sb-shadcn-button--md"
      @click="open = true"
    >
      {{ triggerLabel }}
    </button>
    <div
      v-if="open"
      class="sb-shadcn-dialog__overlay"
      @click="open = false"
    >
      <div
        class="sb-shadcn-dialog__panel"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <header class="sb-shadcn-dialog__header">
          <h3>{{ title }}</h3>
          <button
            type="button"
            class="sb-shadcn-dialog__close"
            aria-label="Close"
            @click="open = false"
          >
            ×
          </button>
        </header>
        <div class="sb-shadcn-dialog__body">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.sb-shadcn-dialog__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: grid;
  place-items: center;
  z-index: 50;
}
.sb-shadcn-dialog__panel {
  min-width: 320px;
  max-width: 90vw;
  background: var(--sb-bg);
  color: var(--sb-fg);
  border: 1px solid var(--sb-border);
  border-radius: 0.75rem;
  overflow: hidden;
}
.sb-shadcn-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--sb-border);
}
.sb-shadcn-dialog__header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}
.sb-shadcn-dialog__close {
  background: none;
  border: none;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  color: var(--sb-muted);
}
.sb-shadcn-dialog__body {
  padding: 1rem;
}
</style>
