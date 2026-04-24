import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import A2Surface from '../../src/components/A2Surface.vue'
import { ADAPTER_INJECTION_KEY } from '../../src/plugin/keys.js'
import { createDefaultAdapter } from '../../src/adapters/default/index.js'

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
  pushSSE(data: string): void {
    if (this.closed) return
    this.controller.enqueue(this.encoder.encode(`data: ${data}\n\n`))
  }
  error(e: unknown): void {
    if (this.closed) return
    this.closed = true
    try {
      this.controller.error(e)
    } catch {
      /* noop */
    }
  }
  abort(): void {
    this.error(new DOMException('aborted', 'AbortError'))
  }
}

interface Call {
  url: string
  headers: Record<string, string>
  handle: StreamHandle
}
const calls: Call[] = []
let nextStatus = 200

async function mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input.toString()
  const h = new Headers(init?.headers)
  const headers: Record<string, string> = {}
  h.forEach((v, k) => {
    headers[k] = v
  })
  const handle = new StreamHandle(init?.signal ?? null)
  const status = nextStatus
  nextStatus = 200
  calls.push({ url, headers, handle })
  return new Response(handle.stream, { status, statusText: status === 200 ? 'OK' : 'Err' })
}

function mountSurface(props: Record<string, unknown> = {}) {
  const adapter = createDefaultAdapter()
  return mount(A2Surface, {
    props: { url: '/agent', ...props },
    global: {
      provide: { [ADAPTER_INJECTION_KEY as symbol]: adapter },
    },
  })
}

describe('A2Surface', () => {
  beforeEach(() => {
    calls.length = 0
    nextStatus = 200
    vi.stubGlobal('fetch', mockFetch)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('opens a fetch connection to the configured url', async () => {
    const wrapper = mountSurface({ url: '/agent/42' })
    await flushPromises()
    expect(calls).toHaveLength(1)
    expect(calls[0]!.url).toBe('/agent/42')
    expect(wrapper.attributes('data-status')).toBe('open')
    wrapper.unmount()
  })

  it('forwards a static Authorization header', async () => {
    const wrapper = mountSurface({
      headers: { Authorization: 'Bearer abc' },
    })
    await flushPromises()
    expect(calls[0]!.headers.authorization).toBe('Bearer abc')
    wrapper.unmount()
  })

  it('awaits an async headers factory on every connect', async () => {
    let token = 'first'
    const factory = vi.fn(async () => ({ Authorization: `Bearer ${token}` }))
    const wrapper = mountSurface({ headers: factory, initialDelayMs: 10, maxDelayMs: 10 })
    await flushPromises()
    expect(calls[0]!.headers.authorization).toBe('Bearer first')

    token = 'second'
    calls[0]!.handle.error(new Error('drop'))
    await flushPromises()
    await new Promise((r) => setTimeout(r, 30))
    await flushPromises()
    expect(calls.at(-1)!.headers.authorization).toBe('Bearer second')
    expect(factory).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })

  it('parses createSurface + updateComponents and renders through the adapter', async () => {
    const wrapper = mountSurface()
    await flushPromises()

    const h = calls[0]!.handle
    h.pushSSE(JSON.stringify({ type: 'createSurface', surfaceId: 's1', title: 'Hi' }))
    h.pushSSE(
      JSON.stringify({
        type: 'updateComponents',
        surfaceId: 's1',
        components: [{ id: 'a', component: { Text: { text: 'rendered' } } }],
      }),
    )
    await flushPromises()
    expect(wrapper.text()).toContain('rendered')
    wrapper.unmount()
  })

  it('silently drops malformed SSE payloads', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mountSurface()
    await flushPromises()

    calls[0]!.handle.pushSSE('{not json')
    calls[0]!.handle.pushSSE('{"type":"nope"}')
    await flushPromises()
    expect(wrapper.find('.agentui-missing').exists()).toBe(false)
    warn.mockRestore()
    wrapper.unmount()
  })

  it('emits a typed error event on http failure', async () => {
    nextStatus = 500
    const wrapper = mountSurface({ maxRetries: 0 })
    await flushPromises()
    const emitted = wrapper.emitted('error')
    expect(emitted).toBeTruthy()
    expect(emitted![0]![0]).toMatchObject({ type: 'http', status: 500 })
    wrapper.unmount()
  })

  it('emits open when the stream is ready', async () => {
    const wrapper = mountSurface()
    await flushPromises()
    expect(wrapper.emitted('open')).toBeTruthy()
    wrapper.unmount()
  })

  it('aborts the active fetch on unmount', async () => {
    const wrapper = mountSurface()
    await flushPromises()
    const handle = calls[0]!.handle
    wrapper.unmount()
    await flushPromises()
    expect(handle.closed).toBe(true)
  })
})
