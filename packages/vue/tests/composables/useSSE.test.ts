import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import type { UseSSEOptions, UseSSEReturn } from '../../src/composables/useSSE.js'
import { useSSE } from '../../src/composables/useSSE.js'

/**
 * Handle on a single fetch call — the test can push SSE chunks, close
 * the stream, or fail it. Mimics the lifecycle of a real SSE connection.
 */
class StreamHandle {
  controller!: ReadableStreamDefaultController<Uint8Array>
  readonly stream: ReadableStream<Uint8Array>
  closed = false
  private readonly encoder = new TextEncoder()

  constructor(signal: AbortSignal | null | undefined) {
    this.stream = new ReadableStream<Uint8Array>({
      start: (c) => {
        this.controller = c
      },
    })
    signal?.addEventListener('abort', () => this.abort())
  }

  pushRaw(chunk: string): void {
    if (this.closed) return
    this.controller.enqueue(this.encoder.encode(chunk))
  }

  pushSSE(data: string): void {
    this.pushRaw(`data: ${data}\n\n`)
  }

  close(): void {
    if (this.closed) return
    this.closed = true
    try {
      this.controller.close()
    } catch {
      /* already closed */
    }
  }

  error(e: unknown): void {
    if (this.closed) return
    this.closed = true
    try {
      this.controller.error(e)
    } catch {
      /* already closed */
    }
  }

  abort(): void {
    this.error(new DOMException('aborted', 'AbortError'))
  }
}

interface FetchCall {
  readonly url: string
  readonly headers: Record<string, string>
  readonly handle: StreamHandle
  readonly responseStatus: number
}

class MockFetch {
  calls: FetchCall[] = []
  nextStatus = 200
  nextFailure: Error | null = null

  fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (this.nextFailure) {
      const err = this.nextFailure
      this.nextFailure = null
      throw err
    }
    const url = typeof input === 'string' ? input : input.toString()
    const headers: Record<string, string> = {}
    const h = new Headers(init?.headers)
    h.forEach((v, k) => {
      headers[k] = v
    })
    const handle = new StreamHandle(init?.signal ?? null)
    const status = this.nextStatus
    this.nextStatus = 200
    const call: FetchCall = { url, headers, handle, responseStatus: status }
    this.calls.push(call)
    return new Response(handle.stream, { status, statusText: status === 200 ? 'OK' : 'Err' })
  }

  last(): FetchCall {
    const last = this.calls.at(-1)
    if (!last) throw new Error('no fetch call recorded')
    return last
  }

  reset(): void {
    this.calls = []
    this.nextStatus = 200
    this.nextFailure = null
  }
}

const mockFetch = new MockFetch()

function mountWithSSE(options: UseSSEOptions): { api: UseSSEReturn; unmount: () => void } {
  let api!: UseSSEReturn
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useSSE(options)
        return () => h('div')
      },
    }),
  )
  return { api, unmount: () => wrapper.unmount() }
}

describe('useSSE', () => {
  beforeEach(() => {
    mockFetch.reset()
    vi.stubGlobal('fetch', mockFetch.fetch)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('connects via fetch with Accept: text/event-stream', async () => {
    const { api, unmount } = mountWithSSE({ url: '/stream' })
    await flushPromises()
    expect(mockFetch.calls).toHaveLength(1)
    expect(mockFetch.last().url).toBe('/stream')
    expect(mockFetch.last().headers.accept).toBe('text/event-stream')
    expect(api.status.value).toBe('open')
    unmount()
  })

  it('parses and delivers complete SSE events', async () => {
    const onMessage = vi.fn()
    const { unmount } = mountWithSSE({ url: '/stream', onMessage })
    await flushPromises()

    mockFetch.last().handle.pushSSE('{"hello":"world"}')
    await flushPromises()
    expect(onMessage).toHaveBeenCalledWith('{"hello":"world"}')
    unmount()
  })

  it('concatenates multi-line data fields with \\n', async () => {
    const onMessage = vi.fn()
    const { unmount } = mountWithSSE({ url: '/stream', onMessage })
    await flushPromises()

    mockFetch.last().handle.pushRaw('data: line-1\ndata: line-2\n\n')
    await flushPromises()
    expect(onMessage).toHaveBeenCalledWith('line-1\nline-2')
    unmount()
  })

  it('reassembles events across chunk boundaries', async () => {
    const onMessage = vi.fn()
    const { unmount } = mountWithSSE({ url: '/stream', onMessage })
    await flushPromises()

    const h = mockFetch.last().handle
    h.pushRaw('data: {"a"')
    await flushPromises()
    expect(onMessage).not.toHaveBeenCalled()
    h.pushRaw(':1}\n\n')
    await flushPromises()
    expect(onMessage).toHaveBeenCalledWith('{"a":1}')
    unmount()
  })

  it('ignores SSE comments and non-message events', async () => {
    const onMessage = vi.fn()
    const { unmount } = mountWithSSE({ url: '/stream', onMessage })
    await flushPromises()

    mockFetch.last().handle.pushRaw(': keepalive\n\n')
    mockFetch.last().handle.pushRaw('event: ping\ndata: pong\n\n')
    await flushPromises()
    expect(onMessage).not.toHaveBeenCalled()
    unmount()
  })

  it('sends static headers on the request', async () => {
    const { unmount } = mountWithSSE({
      url: '/stream',
      headers: { Authorization: 'Bearer static-token', 'X-Trace': 'abc' },
    })
    await flushPromises()
    expect(mockFetch.last().headers.authorization).toBe('Bearer static-token')
    expect(mockFetch.last().headers['x-trace']).toBe('abc')
    unmount()
  })

  it('awaits an async headers factory', async () => {
    const factory = vi.fn(async () => ({
      Authorization: `Bearer token-${factory.mock.calls.length}`,
    }))
    const { unmount } = mountWithSSE({ url: '/stream', headers: factory })
    await flushPromises()
    expect(factory).toHaveBeenCalledOnce()
    expect(mockFetch.last().headers.authorization).toBe('Bearer token-1')
    unmount()
  })

  it('re-resolves headers on every reconnect', async () => {
    const tokens = ['A', 'B', 'C']
    const factory = vi.fn(async () => ({ Authorization: `Bearer ${tokens.shift() ?? 'X'}` }))
    vi.useFakeTimers()
    const { unmount } = mountWithSSE({
      url: '/stream',
      headers: factory,
      initialDelayMs: 10,
      maxDelayMs: 10,
    })
    await flushPromises()
    expect(mockFetch.last().headers.authorization).toBe('Bearer A')

    mockFetch.last().handle.error(new Error('boom'))
    await flushPromises()
    await vi.advanceTimersByTimeAsync(10)
    await flushPromises()
    expect(mockFetch.last().headers.authorization).toBe('Bearer B')

    mockFetch.last().handle.error(new Error('boom'))
    await flushPromises()
    await vi.advanceTimersByTimeAsync(10)
    await flushPromises()
    expect(mockFetch.last().headers.authorization).toBe('Bearer C')
    expect(factory).toHaveBeenCalledTimes(3)
    unmount()
  })

  it('surfaces a typed "http" error when the response is not ok', async () => {
    const onError = vi.fn()
    mockFetch.nextStatus = 401
    const { api, unmount } = mountWithSSE({ url: '/stream', onError, maxRetries: 0 })
    await flushPromises()

    expect(api.status.value).toBe('closed') // give-up after 0 retries
    expect(api.error.value).not.toBeNull()
    expect(api.error.value?.type).toBe('http')
    expect(api.error.value?.status).toBe(401)
    expect(onError).toHaveBeenCalledOnce()
    unmount()
  })

  it('surfaces a typed "network" error when fetch rejects', async () => {
    const onError = vi.fn()
    mockFetch.nextFailure = new TypeError('Failed to fetch')
    const { api, unmount } = mountWithSSE({ url: '/stream', onError, maxRetries: 0 })
    await flushPromises()
    expect(api.error.value?.type).toBe('network')
    expect(api.error.value?.message).toBe('Failed to fetch')
    unmount()
  })

  it('surfaces a typed "network" error when the headers factory rejects', async () => {
    const onError = vi.fn()
    const { api, unmount } = mountWithSSE({
      url: '/stream',
      headers: async () => {
        throw new Error('token service down')
      },
      onError,
      maxRetries: 0,
    })
    await flushPromises()
    expect(api.error.value?.type).toBe('network')
    expect(api.error.value?.message).toBe('token service down')
    expect(mockFetch.calls).toHaveLength(0)
    unmount()
  })

  it('schedules reconnect with exponential backoff capped at maxDelayMs', async () => {
    vi.useFakeTimers()
    const { unmount } = mountWithSSE({
      url: '/stream',
      initialDelayMs: 100,
      maxDelayMs: 400,
    })
    await flushPromises()

    mockFetch.last().handle.error(new Error('drop'))
    await flushPromises()
    await vi.advanceTimersByTimeAsync(99)
    expect(mockFetch.calls).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1)
    await flushPromises()
    expect(mockFetch.calls).toHaveLength(2)

    mockFetch.last().handle.error(new Error('drop'))
    await flushPromises()
    await vi.advanceTimersByTimeAsync(200)
    await flushPromises()
    expect(mockFetch.calls).toHaveLength(3)

    mockFetch.last().handle.error(new Error('drop'))
    await flushPromises()
    await vi.advanceTimersByTimeAsync(400)
    await flushPromises()
    expect(mockFetch.calls).toHaveLength(4)

    mockFetch.last().handle.error(new Error('drop'))
    await flushPromises()
    await vi.advanceTimersByTimeAsync(400) // capped, not 800
    await flushPromises()
    expect(mockFetch.calls).toHaveLength(5)
    unmount()
  })

  it('resets the retry counter when the connection opens', async () => {
    vi.useFakeTimers()
    const { api, unmount } = mountWithSSE({
      url: '/stream',
      initialDelayMs: 10,
      maxDelayMs: 10,
    })
    await flushPromises()
    mockFetch.last().handle.error(new Error('boom'))
    await flushPromises()
    expect(api.retries.value).toBe(1)

    await vi.advanceTimersByTimeAsync(10)
    await flushPromises()
    expect(api.retries.value).toBe(0)
    unmount()
  })

  it('honours maxRetries and fires onGiveUp (consecutive failures)', async () => {
    vi.useFakeTimers()
    const onGiveUp = vi.fn()
    // Make every fetch attempt reject *before* the stream ever opens, so
    // retries don't reset via a successful `open`.
    mockFetch.nextFailure = new TypeError('fail-1')
    const { api, unmount } = mountWithSSE({
      url: '/stream',
      initialDelayMs: 10,
      maxDelayMs: 10,
      maxRetries: 2,
      onGiveUp,
    })
    await flushPromises() // retries=1

    mockFetch.nextFailure = new TypeError('fail-2')
    await vi.advanceTimersByTimeAsync(10)
    await flushPromises() // retries=2

    mockFetch.nextFailure = new TypeError('fail-3')
    await vi.advanceTimersByTimeAsync(10)
    await flushPromises() // retries >= 2 → give up

    expect(onGiveUp).toHaveBeenCalledOnce()
    expect(api.status.value).toBe('closed')
    unmount()
  })

  it('aborts the active fetch on disconnect', async () => {
    const { api, unmount } = mountWithSSE({ url: '/stream' })
    await flushPromises()

    api.disconnect()
    await flushPromises()
    expect(api.status.value).toBe('closed')
    unmount()
  })

  it('does not reconnect after manual disconnect', async () => {
    vi.useFakeTimers()
    const { api, unmount } = mountWithSSE({ url: '/stream', initialDelayMs: 10 })
    await flushPromises()
    api.disconnect()
    await vi.advanceTimersByTimeAsync(1000)
    expect(mockFetch.calls).toHaveLength(1)
    unmount()
  })

  it('reconnects when the server closes the stream cleanly', async () => {
    vi.useFakeTimers()
    const { unmount } = mountWithSSE({
      url: '/stream',
      initialDelayMs: 10,
      maxDelayMs: 10,
    })
    await flushPromises()
    mockFetch.last().handle.close()
    await flushPromises()
    await vi.advanceTimersByTimeAsync(10)
    await flushPromises()
    expect(mockFetch.calls).toHaveLength(2)
    unmount()
  })

  it('closes on unmount', async () => {
    const { api, unmount } = mountWithSSE({ url: '/stream' })
    await flushPromises()
    unmount()
    await flushPromises()
    expect(api.status.value).toBe('closed')
  })

  it('reacts to a reactive url change with a fresh connection', async () => {
    const url = ref('/a')
    const { unmount } = mountWithSSE({ url })
    await flushPromises()
    expect(mockFetch.last().url).toBe('/a')

    url.value = '/b'
    await nextTick()
    await flushPromises()
    expect(mockFetch.last().url).toBe('/b')
    unmount()
  })
})
