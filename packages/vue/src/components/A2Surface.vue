<script setup lang="ts">
/**
 * Live-connected A2UI surface.
 *
 * Opens an SSE stream via `fetch` to `url`, parses every incoming message
 * with {@link parseMessage} and applies it to a local {@link useSurface}
 * state. Reconnects with exponential backoff on error; exposes `status`,
 * `error`, and `retries` via `defineExpose` and emits `open` / `error` /
 * `give-up` events for parent components.
 *
 * Accepts a `headers` prop — either a static object or a (possibly
 * async) factory — so `Authorization` tokens can be refreshed on every
 * connect and reconnect.
 */
import { computed, toRef } from 'vue'
import { parseMessage } from '@berkantdev/agentui-core'
import { useSSE } from '../composables/useSSE.js'
import type { SSEError, SSEHeaders } from '../composables/useSSE.js'
import { useSurface } from '../composables/useSurface.js'
import A2Renderer from './A2Renderer.vue'

const props = withDefaults(
  defineProps<{
    url: string
    headers?: SSEHeaders
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
  (e: 'error', error: SSEError): void
  (e: 'give-up'): void
}>()

const { components, dataModel, applyMessage } = useSurface()

const { status, error, retries } = useSSE({
  url: toRef(props, 'url'),
  // Forwarded as a factory so prop changes take effect on the next (re)connect.
  headers: () => {
    const h = props.headers
    if (h === undefined) return {}
    return typeof h === 'function' ? h() : h
  },
  autoConnect: props.autoConnect,
  initialDelayMs: props.initialDelayMs,
  maxDelayMs: props.maxDelayMs,
  maxRetries: props.maxRetries,
  onMessage: (raw) => {
    const msg = parseMessage(raw)
    if (msg) applyMessage(msg)
  },
  onOpen: () => emit('open'),
  onError: (err) => emit('error', err),
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
