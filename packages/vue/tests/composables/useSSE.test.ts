import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import type { UseSSEReturn } from '../../src/composables/useSSE.js'
import { useSSE } from '../../src/composables/useSSE.js'

class MockEventSource {
  static instances: MockEventSource[] = []
  url: string
  readyState = 0
  onopen: ((ev: Event) => void) | null = null
  onmessage: ((ev: MessageEvent<string>) => void) | null = null
  onerror: ((ev: Event) => void) | null = null
  closed = false

  constructor(url: string) {
    this.url = url
    MockEventSource.instances.push(this)
  }
  close() {
    this.closed = true
    this.readyState = 2
  }

  emitOpen() {
    this.readyState = 1
    this.onopen?.(new Event('open'))
  }
  emitMessage(data: string) {
    this.onmessage?.(new MessageEvent('message', { data }))
  }
  emitError() {
    this.onerror?.(new Event('error'))
  }

  static last(): MockEventSource {
    const last = MockEventSource.instances.at(-1)
    if (!last) throw new Error('no EventSource was constructed')
    return last
  }
  static reset() {
    MockEventSource.instances = []
  }
}

function mountWithSSE(
  url: string,
  options: Parameters<typeof useSSE>[1] = {},
): { api: UseSSEReturn; unmount: () => void } {
  let api!: UseSSEReturn
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useSSE(ref(url), options)
        return () => h('div')
      },
    }),
  )
  return { api, unmount: () => wrapper.unmount() }
}

describe('useSSE', () => {
  beforeEach(() => {
    MockEventSource.reset()
    vi.stubGlobal('EventSource', MockEventSource)
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('connects on mount and reports status transitions', async () => {
    const { api, unmount } = mountWithSSE('/stream')
    await nextTick()
    expect(api.status.value).toBe('connecting')

    MockEventSource.last().emitOpen()
    await nextTick()
    expect(api.status.value).toBe('open')
    expect(api.retries.value).toBe(0)
    unmount()
  })

  it('invokes onMessage with raw SSE data', async () => {
    const onMessage = vi.fn()
    const { unmount } = mountWithSSE('/stream', { onMessage })
    await nextTick()
    MockEventSource.last().emitMessage('hello')
    expect(onMessage).toHaveBeenCalledWith('hello')
    unmount()
  })

  it('schedules reconnect with exponential backoff, capped at maxDelayMs', async () => {
    const { api, unmount } = mountWithSSE('/stream', {
      initialDelayMs: 100,
      maxDelayMs: 400,
    })
    await nextTick()

    MockEventSource.last().emitError()
    expect(api.status.value).toBe('error')
    expect(api.retries.value).toBe(1)

    // first retry scheduled at 100ms
    await vi.advanceTimersByTimeAsync(99)
    expect(MockEventSource.instances).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(MockEventSource.instances).toHaveLength(2)

    MockEventSource.last().emitError()
    expect(api.retries.value).toBe(2)
    // second retry at 200ms
    await vi.advanceTimersByTimeAsync(200)
    expect(MockEventSource.instances).toHaveLength(3)

    MockEventSource.last().emitError()
    // third retry at 400ms (capped)
    await vi.advanceTimersByTimeAsync(400)
    expect(MockEventSource.instances).toHaveLength(4)

    MockEventSource.last().emitError()
    // fourth retry also capped at 400ms (not 800ms)
    await vi.advanceTimersByTimeAsync(400)
    expect(MockEventSource.instances).toHaveLength(5)

    unmount()
  })

  it('resets retry counter when the connection opens', async () => {
    const { api, unmount } = mountWithSSE('/stream', {
      initialDelayMs: 10,
      maxDelayMs: 50,
    })
    await nextTick()
    MockEventSource.last().emitError()
    expect(api.retries.value).toBe(1)

    await vi.advanceTimersByTimeAsync(10)
    MockEventSource.last().emitOpen()
    expect(api.retries.value).toBe(0)
    unmount()
  })

  it('honours maxRetries and emits onGiveUp', async () => {
    const onGiveUp = vi.fn()
    const { api, unmount } = mountWithSSE('/stream', {
      initialDelayMs: 10,
      maxDelayMs: 10,
      maxRetries: 2,
      onGiveUp,
    })
    await nextTick()

    MockEventSource.last().emitError()
    await vi.advanceTimersByTimeAsync(10)
    MockEventSource.last().emitError()
    await vi.advanceTimersByTimeAsync(10)
    MockEventSource.last().emitError() // 3rd failure — no more retries

    expect(onGiveUp).toHaveBeenCalledOnce()
    expect(api.status.value).toBe('closed')
    unmount()
  })

  it('closes the EventSource on disconnect and on unmount', async () => {
    const { api, unmount } = mountWithSSE('/stream')
    await nextTick()
    const source = MockEventSource.last()
    api.disconnect()
    expect(source.closed).toBe(true)
    expect(api.status.value).toBe('closed')

    unmount() // should not throw, even with no active source
  })

  it('does not reconnect after manual disconnect', async () => {
    const { api, unmount } = mountWithSSE('/stream', { initialDelayMs: 10 })
    await nextTick()
    api.disconnect()
    await vi.advanceTimersByTimeAsync(1000)
    expect(MockEventSource.instances).toHaveLength(1)
    unmount()
  })
})
