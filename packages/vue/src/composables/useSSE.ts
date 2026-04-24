import { onUnmounted, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'

export type SSEStatus = 'idle' | 'connecting' | 'open' | 'error' | 'closed'

export interface UseSSEOptions {
  /** Auto-connect on mount. Defaults to `true`. */
  readonly autoConnect?: boolean
  /** Base delay in ms for the first reconnect attempt. Default `500`. */
  readonly initialDelayMs?: number
  /** Cap for the exponential backoff in ms. Default `30_000`. */
  readonly maxDelayMs?: number
  /** Maximum reconnect attempts. `Infinity` means unlimited. Default `Infinity`. */
  readonly maxRetries?: number
  /** Invoked for every `message` event with the raw `data` string. */
  readonly onMessage?: (raw: string) => void
  /** Invoked when the connection opens successfully. */
  readonly onOpen?: () => void
  /** Invoked on error events — reconnect is still attempted automatically. */
  readonly onError?: (event: Event) => void
  /** Invoked when retries are exhausted. */
  readonly onGiveUp?: () => void
}

export interface UseSSEReturn {
  readonly status: Ref<SSEStatus>
  readonly error: Ref<Event | null>
  readonly retries: Ref<number>
  connect: () => void
  disconnect: () => void
}

/**
 * Lifecycle-aware SSE client with exponential backoff.
 *
 * - Backoff: `min(initialDelayMs * 2^retries, maxDelayMs)` per attempt.
 * - Retry count resets to `0` every time the connection opens.
 * - `disconnect` is called automatically on `onUnmounted`.
 * - The `url` may be reactive: when it changes we disconnect + reconnect.
 *
 * @example
 * const { status, connect, disconnect } = useSSE(() => `/agent/${id.value}`, {
 *   onMessage: (raw) => {
 *     const msg = parseMessage(raw)
 *     if (msg) applyMessage(msg)
 *   },
 * })
 */
export function useSSE(url: MaybeRefOrGetter<string>, options: UseSSEOptions = {}): UseSSEReturn {
  const initialDelayMs = options.initialDelayMs ?? 500
  const maxDelayMs = options.maxDelayMs ?? 30_000
  const maxRetries = options.maxRetries ?? Number.POSITIVE_INFINITY
  const autoConnect = options.autoConnect ?? true

  const status = ref<SSEStatus>('idle')
  const error = ref<Event | null>(null)
  const retries = ref(0)

  let es: EventSource | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let manualDisconnect = false

  function clearTimer() {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  function closeSource() {
    if (es !== null) {
      es.close()
      es = null
    }
  }

  function scheduleReconnect() {
    if (manualDisconnect) return
    if (retries.value >= maxRetries) {
      status.value = 'closed'
      options.onGiveUp?.()
      return
    }
    const delay = Math.min(initialDelayMs * 2 ** retries.value, maxDelayMs)
    retries.value += 1
    clearTimer()
    reconnectTimer = setTimeout(connect, delay)
  }

  function connect() {
    manualDisconnect = false
    clearTimer()
    closeSource()

    const resolved = toValue(url)
    if (!resolved) return

    status.value = 'connecting'
    error.value = null

    const source = new EventSource(resolved)
    es = source

    source.onopen = () => {
      status.value = 'open'
      retries.value = 0
      options.onOpen?.()
    }
    source.onmessage = (ev: MessageEvent<string>) => {
      options.onMessage?.(ev.data)
    }
    source.onerror = (ev: Event) => {
      error.value = ev
      status.value = 'error'
      closeSource()
      scheduleReconnect()
      options.onError?.(ev)
    }
  }

  function disconnect() {
    manualDisconnect = true
    clearTimer()
    closeSource()
    status.value = 'closed'
  }

  if (autoConnect) {
    watch(
      () => toValue(url),
      (next, prev) => {
        if (next !== prev) {
          retries.value = 0
          if (next) connect()
          else disconnect()
        }
      },
      { immediate: true },
    )
  }

  onUnmounted(disconnect)

  return { status, error, retries, connect, disconnect }
}
