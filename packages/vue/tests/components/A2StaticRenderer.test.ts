import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import A2StaticRenderer from '../../src/components/A2StaticRenderer.vue'
import { createDefaultAdapter } from '../../src/adapters/default/index.js'

describe('A2StaticRenderer', () => {
  it('renders mapped default components', () => {
    const adapter = createDefaultAdapter()
    const wrapper = mount(A2StaticRenderer, {
      props: {
        adapter,
        components: [
          { id: 'a', component: { Text: { text: 'Hello' } } },
          { id: 'b', component: { Button: { label: 'Go' } } },
        ],
      },
    })
    expect(wrapper.text()).toContain('Hello')
    expect(wrapper.find('button.agentui-button').text()).toBe('Go')
  })

  it('falls back to the placeholder for uncovered types', () => {
    const adapter = createDefaultAdapter()
    const wrapper = mount(A2StaticRenderer, {
      props: {
        adapter,
        components: [{ id: 'a', component: { Slider: { value: 1 } } }],
      },
    })
    expect(wrapper.find('.agentui-placeholder').exists()).toBe(true)
  })

  it('renders nothing when components is empty', () => {
    const adapter = createDefaultAdapter()
    const wrapper = mount(A2StaticRenderer, {
      props: { adapter, components: [] },
    })
    expect(wrapper.find('.agentui-static').exists()).toBe(true)
    expect(wrapper.find('.agentui-static').element.children).toHaveLength(0)
  })

  it('shows the unmapped-component marker when no adapter is supplied', () => {
    const adapter = { name: 'empty', components: {} }
    const wrapper = mount(A2StaticRenderer, {
      props: {
        adapter,
        components: [{ id: 'a', component: { Button: { label: 'X' } } }],
      },
    })
    expect(wrapper.find('.agentui-missing').exists()).toBe(true)
    expect(wrapper.find('.agentui-missing').text()).toContain('Button')
  })
})
