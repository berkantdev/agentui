import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import A2Surface from '../../src/components/A2Surface.vue'
import { ADAPTER_INJECTION_KEY } from '../../src/plugin/keys.js'
import { createDefaultAdapter } from '../../src/adapters/default/index.js'

class MockEventSource {
  static instances: MockEventSource[] = []
  url: string
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
  }
  emitOpen() {
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
    if (!last) throw new Error('no EventSource constructed')
    return last
  }
  static reset() {
    MockEventSource.instances = []
  }
}

function mountSurface(url = '/agent') {
  const adapter = createDefaultAdapter()
  return mount(A2Surface, {
    props: { url },
    global: {
      provide: { [ADAPTER_INJECTION_KEY as symbol]: adapter },
    },
  })
}

describe('A2Surface', () => {
  beforeEach(() => {
    MockEventSource.reset()
    vi.stubGlobal('EventSource', MockEventSource)
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('opens an EventSource for the given url', async () => {
    const wrapper = mountSurface('/agent/42')
    await nextTick()
    expect(MockEventSource.last().url).toBe('/agent/42')
    expect(wrapper.attributes('data-status')).toBe('connecting')
    wrapper.unmount()
  })

  it('flips data-status to "open" when the connection opens', async () => {
    const wrapper = mountSurface()
    await nextTick()
    MockEventSource.last().emitOpen()
    await nextTick()
    expect(wrapper.attributes('data-status')).toBe('open')
    wrapper.unmount()
  })

  it('parses and renders a full createSurface + updateComponents flow', async () => {
    const wrapper = mountSurface()
    await nextTick()

    const src = MockEventSource.last()
    src.emitOpen()
    src.emitMessage(JSON.stringify({ type: 'createSurface', surfaceId: 's1', title: 'Hi' }))
    src.emitMessage(
      JSON.stringify({
        type: 'updateComponents',
        surfaceId: 's1',
        components: [{ id: 'a', component: { Text: { text: 'rendered' } } }],
      }),
    )
    await nextTick()

    expect(wrapper.text()).toContain('rendered')
    wrapper.unmount()
  })

  it('silently drops malformed SSE payloads', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mountSurface()
    await nextTick()

    MockEventSource.last().emitMessage('{not json')
    MockEventSource.last().emitMessage('{"type":"nope"}')
    await nextTick()

    // still no components rendered
    expect(wrapper.find('.agentui-missing').exists()).toBe(false)
    warn.mockRestore()
    wrapper.unmount()
  })

  it('closes the EventSource on unmount', async () => {
    const wrapper = mountSurface()
    await nextTick()
    const source = MockEventSource.last()
    wrapper.unmount()
    expect(source.closed).toBe(true)
  })

  it('emits `open` and `error` events to the parent', async () => {
    const wrapper = mountSurface()
    await nextTick()
    const src = MockEventSource.last()

    src.emitOpen()
    await nextTick()
    expect(wrapper.emitted('open')).toBeTruthy()

    src.emitError()
    await nextTick()
    expect(wrapper.emitted('error')).toBeTruthy()
    wrapper.unmount()
  })
})
