<script setup lang="ts">
/**
 * Live-connected A2UI surface.
 *
 * Opens an SSE connection to `url`, parses every incoming message with
 * {@link parseMessage} and applies it to a local {@link useSurface}
 * state. Reconnects with exponential backoff on error; exposes
 * `status`, `error`, and `retries` via `defineExpose` and emits
 * `open` / `error` / `give-up` events for parent components.
 *
 * The `status` slot receives the current connection state so parents
 * can render their own loading or error chrome.
 */
import { computed, toRef } from 'vue'
import { parseMessage } from '@berkantdev/agentui-core'
import { useSSE } from '../composables/useSSE.js'
import { useSurface } from '../composables/useSurface.js'
import A2Renderer from './A2Renderer.vue'

const props = withDefaults(
  defineProps<{
    url: string
    autoConnect?: boolean
    initialDelayMs?: number
    maxDelayMs?: number
    maxRetries?: number
  }>(),
  {
    autoConnect: true,
    initialDelayMs: 500,
    maxDelayMs: 30_000,
    maxRetries: Number.POSITIVE_INFINITY,
  },
)

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'error', event: Event): void
  (e: 'give-up'): void
}>()

const { components, dataModel, applyMessage } = useSurface()

const { status, error, retries } = useSSE(toRef(props, 'url'), {
  autoConnect: props.autoConnect,
  initialDelayMs: props.initialDelayMs,
  maxDelayMs: props.maxDelayMs,
  maxRetries: props.maxRetries,
  onMessage: (raw) => {
    const msg = parseMessage(raw)
    if (msg) applyMessage(msg)
  },
  onOpen: () => emit('open'),
  onError: (ev) => emit('error', ev),
  onGiveUp: () => emit('give-up'),
})

const list = computed(() => Array.from(components.value.values()))

defineExpose({ status, error, retries })
</script>

<template>
  <div class="agentui-surface" :data-status="status">
    <slot name="status" :status="status" :error="error" :retries="retries" />
    <A2Renderer v-for="c in list" :key="c.id" :component="c" :data-model="dataModel" />
  </div>
</template>
