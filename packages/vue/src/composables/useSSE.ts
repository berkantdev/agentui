import { onUnmounted, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'

/**
 * Runtime state of the SSE connection.
 *
 * - `idle` — not yet started
 * - `connecting` — fetch in flight, waiting for `open`
 * - `open` — streaming messages
 * - `error` — last attempt failed; a reconnect may be scheduled
 * - `closed` — disconnected manually or after `maxRetries` exhausted
 */
export type SSEStatus = 'idle' | 'connecting' | 'open' | 'error' | 'closed'

/**
 * Request headers passed with every (re)connect.
 *
 * The factory form is awaited on each attempt — use it to return a
 * freshly-refreshed token so the stream never opens with a stale
 * `Authorization` header.
 */
export type SSEHeaders =
  | Record<string, string>
  | (() => Record<string, string> | Promise<Record<string, string>>)

/**
 * Structured error surfaced on `error.value` and via `onError`.
 *
 * - `network` — fetch itself rejected (DNS, CORS, header factory threw, etc.)
 * - `http` — response returned but `response.ok === false` (`status` set)
 * - `parse` — the response body stream errored while reading
 */
export interface SSEError {
  readonly type: 'network' | 'http' | 'parse'
  readonly status?: number | undefined
  readonly message: string
  readonly raw?: unknown
}

export interface UseSSEOptions {
  /** Event-stream URL. May be reactive — the composable reconnects on change. */
  readonly url: MaybeRefOrGetter<string>
  /**
   * Request headers. Pass an object for static values, or a (possibly
   * async) function that returns fresh headers on every connect and
   * reconnect — ideal for expiring bearer tokens.
   */
  readonly headers?: SSEHeaders
  /** Auto-connect on mount and when `url` changes. Defaults to `true`. */
  readonly autoConnect?: boolean
  /** Base delay in ms for the first reconnect attempt. Default `500`. */
  readonly initialDelayMs?: number
  /** Cap for the exponential backoff in ms. Default `30_000`. */
  readonly maxDelayMs?: number
  /** Maximum reconnect attempts. `Infinity` means unlimited. Default `Infinity`. */
  readonly maxRetries?: number
  /** Invoked for every SSE `message` event with the concatenated `data:` payload. */
  readonly onMessage?: (raw: string) => void
  /** Invoked when the connection opens successfully. */
  readonly onOpen?: () => void
  /** Invoked with a typed {@link SSEError}. A reconnect is still attempted. */
  readonly onError?: (error: SSEError) => void
  /** Invoked when retries are exhausted. */
  readonly onGiveUp?: () => void
}

export interface UseSSEReturn {
  readonly status: Ref<SSEStatus>
  readonly error: Ref<SSEError | null>
  readonly retries: Ref<number>
  connect: () => void
  disconnect: () => void
}

async function resolveHeaders(headers: SSEHeaders | undefined): Promise<Record<string, string>> {
  if (!headers) return {}
  if (typeof headers === 'function') return await headers()
  return headers
}

/**
 * Consumes a rolling buffer of raw SSE text and invokes `onData` with the
 * concatenated `data:` payload of every *complete* event.
 *
 * Returns the trailing incomplete fragment — the caller prepends the next
 * chunk to it before calling again. Handles all three event-separators
 * defined by the spec (LF/CRLF/CR) and silently skips non-message events.
 */
function parseSSEBuffer(buffer: string, onData: (data: string) => void): string {
  const parts = buffer.split(/\r\n\r\n|\n\n|\r\r/)
  const incomplete = parts.pop() ?? ''
  for (const part of parts) {
    if (!part) continue
    const lines = part.split(/\r\n|\n|\r/)
    const dataLines: string[] = []
    let eventType = 'message'
    for (const line of lines) {
      if (!line || line.startsWith(':')) continue
      const colon = line.indexOf(':')
      const field = colon === -1 ? line : line.slice(0, colon)
      let value = colon === -1 ? '' : line.slice(colon + 1)
      if (value.startsWith(' ')) value = value.slice(1)
      if (field === 'data') dataLines.push(value)
      else if (field === 'event') eventType = value
    }
    if (dataLines.length > 0 && (eventType === '' || eventType === 'message')) {
      onData(dataLines.join('\n'))
    }
  }
  return incomplete
}

/**
 * Lifecycle-aware SSE client built on `fetch` + `ReadableStream`, so
 * custom headers (e.g. `Authorization`) flow through naturally.
 *
 * - Backoff: `min(initialDelayMs * 2^retries, maxDelayMs)` per attempt.
 * - Retry count resets to `0` every time the connection opens.
 * - `headers` is re-resolved before each connect and reconnect.
 * - `disconnect` aborts the active fetch and is called automatically on
 *   `onUnmounted`.
 *
 * @example
 * const { status, connect, disconnect } = useSSE({
 *   url: () => `/agent/${id.value}`,
 *   headers: async () => ({
 *     Authorization: `Bearer ${await refreshToken()}`,
 *   }),
 *   onMessage: (raw) => {
 *     const msg = parseMessage(raw)
 *     if (msg) applyMessage(msg)
 *   },
 * })
 */
export function useSSE(options: UseSSEOptions): UseSSEReturn {
  const initialDelayMs = options.initialDelayMs ?? 500
  const maxDelayMs = options.maxDelayMs ?? 30_000
  const maxRetries = options.maxRetries ?? Number.POSITIVE_INFINITY
  const autoConnect = options.autoConnect ?? true

  const status = ref<SSEStatus>('idle')
  const error = ref<SSEError | null>(null)
  const retries = ref(0)

  let controller: AbortController | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let manualDisconnect = false
  let connectId = 0

  function clearTimer(): void {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  function abortActive(): void {
    if (controller !== null) {
      controller.abort()
      controller = null
    }
  }

  function reportError(next: SSEError): void {
    error.value = next
    status.value = 'error'
    options.onError?.(next)
    scheduleReconnect()
  }

  function scheduleReconnect(): void {
    if (manualDisconnect) return
    if (retries.value >= maxRetries) {
      status.value = 'closed'
      options.onGiveUp?.()
      return
    }
    const delay = Math.min(initialDelayMs * 2 ** retries.value, maxDelayMs)
    retries.value += 1
    clearTimer()
    reconnectTimer = setTimeout(() => {
      void connect()
    }, delay)
  }

  async function connect(): Promise<void> {
    manualDisconnect = false
    clearTimer()
    abortActive()

    const resolved = toValue(options.url)
    if (!resolved) return

    const myId = ++connectId
    const ac = new AbortController()
    controller = ac
    status.value = 'connecting'
    error.value = null

    let resolvedHeaders: Record<string, string>
    try {
      resolvedHeaders = await resolveHeaders(options.headers)
    } catch (e) {
      if (myId !== connectId) return
      reportError({
        type: 'network',
        message: e instanceof Error ? e.message : 'headers factory rejected',
        raw: e,
      })
      return
    }

    let response: Response
    try {
      response = await fetch(resolved, {
        method: 'GET',
        headers: { Accept: 'text/event-stream', ...resolvedHeaders },
        signal: ac.signal,
      })
    } catch (e) {
      if (myId !== connectId || ac.signal.aborted) return
      reportError({
        type: 'network',
        message: e instanceof Error ? e.message : 'fetch rejected',
        raw: e,
      })
      return
    }

    if (myId !== connectId || ac.signal.aborted) return

    if (!response.ok) {
      reportError({
        type: 'http',
        status: response.status,
        message: `SSE request failed: ${response.status} ${response.statusText}`,
      })
      return
    }
    if (!response.body) {
      reportError({
        type: 'http',
        status: response.status,
        message: 'SSE response has no body',
      })
      return
    }

    status.value = 'open'
    retries.value = 0
    options.onOpen?.()

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        buffer = parseSSEBuffer(buffer, (data) => options.onMessage?.(data))
      }
    } catch (e) {
      if (myId !== connectId || ac.signal.aborted) return
      reportError({
        type: 'parse',
        message: e instanceof Error ? e.message : 'stream read failed',
        raw: e,
      })
      return
    }

    if (myId === connectId && !ac.signal.aborted) {
      // Server closed the stream cleanly — reconnect with backoff, matching EventSource behaviour.
      status.value = 'closed'
      scheduleReconnect()
    }
  }

  function disconnect(): void {
    manualDisconnect = true
    clearTimer()
    abortActive()
    status.value = 'closed'
  }

  if (autoConnect) {
    watch(
      () => toValue(options.url),
      (next, prev) => {
        if (next !== prev) {
          retries.value = 0
          if (next) void connect()
          else disconnect()
        }
      },
      { immediate: true },
    )
  }

  onUnmounted(disconnect)

  return {
    status,
    error,
    retries,
    connect: () => {
      void connect()
    },
    disconnect,
  }
}
