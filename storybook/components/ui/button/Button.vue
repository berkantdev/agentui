<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils.js'

const button = cva('sb-shadcn-button', {
  variants: {
    variant: {
      default: 'sb-shadcn-button--default',
      outline: 'sb-shadcn-button--outline',
      ghost: 'sb-shadcn-button--ghost',
      destructive: 'sb-shadcn-button--destructive',
    },
    size: {
      sm: 'sb-shadcn-button--sm',
      md: 'sb-shadcn-button--md',
      lg: 'sb-shadcn-button--lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

type ButtonVariants = VariantProps<typeof button>

withDefaults(
  defineProps<{
    label?: string
    action?: string
    disabled?: boolean
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
  }>(),
  { label: '', action: '', disabled: false, variant: 'default', size: 'md' },
)

const emit = defineEmits<{ (e: 'action', name: string): void }>()

function onClick(event: MouseEvent) {
  const target = event.currentTarget as HTMLButtonElement | null
  emit('action', target?.dataset.action ?? '')
}
</script>

<template>
  <button
    type="button"
    :class="cn(button({ variant, size }))"
    :data-action="action"
    :disabled="disabled"
    @click="onClick"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<style>
.sb-shadcn-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 150ms,
    border-color 150ms,
    opacity 150ms;
}
.sb-shadcn-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.sb-shadcn-button--sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
}
.sb-shadcn-button--md {
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
}
.sb-shadcn-button--lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}
.sb-shadcn-button--default {
  background: var(--sb-fg);
  color: var(--sb-bg);
}
.sb-shadcn-button--default:hover {
  opacity: 0.9;
}
.sb-shadcn-button--outline {
  background: transparent;
  border-color: var(--sb-border);
  color: var(--sb-fg);
}
.sb-shadcn-button--outline:hover {
  background: var(--sb-card);
}
.sb-shadcn-button--ghost {
  background: transparent;
  color: var(--sb-fg);
}
.sb-shadcn-button--ghost:hover {
  background: var(--sb-card);
}
.sb-shadcn-button--destructive {
  background: #dc2626;
  color: #ffffff;
}
.sb-shadcn-button--destructive:hover {
  background: #b91c1c;
}
</style>
