import { describe, expect, it } from 'vitest'
import { defineComponent, h, markRaw } from 'vue'
import { mount } from '@vue/test-utils'
import type { AgentUIAdapter } from '@berkantdev/agentui-core'
import type { Component } from 'vue'
import A2Renderer from '../../src/components/A2Renderer.vue'
import { ADAPTER_INJECTION_KEY } from '../../src/plugin/keys.js'

const TextStub = markRaw(
  defineComponent({
    name: 'TextStub',
    props: { text: { type: String, default: '' } },
    setup: (props) => () => h('p', { class: 'stub-text' }, props.text),
  }),
)

function makeAdapter(components: Record<string, Component>): AgentUIAdapter<Component> {
  return { name: 'test', components }
}

function mountWithAdapter(
  component: { id: string; component: Record<string, unknown> },
  adapter: AgentUIAdapter<Component>,
) {
  return mount(A2Renderer, {
    props: { component, dataModel: {} },
    global: {
      provide: { [ADAPTER_INJECTION_KEY as symbol]: adapter },
    },
  })
}

describe('A2Renderer', () => {
  it('resolves the adapter component for the given type and forwards props', () => {
    const adapter = makeAdapter({ Text: TextStub })
    const wrapper = mountWithAdapter({ id: 'a', component: { Text: { text: 'Hello' } } }, adapter)
    expect(wrapper.find('.stub-text').exists()).toBe(true)
    expect(wrapper.find('.stub-text').text()).toBe('Hello')
  })

  it('renders the unmapped-marker when the adapter has no entry for the type', () => {
    const adapter = makeAdapter({})
    const wrapper = mountWithAdapter({ id: 'a', component: { Button: { label: 'Go' } } }, adapter)
    expect(wrapper.find('.agentui-missing').exists()).toBe(true)
    expect(wrapper.find('.agentui-missing').attributes('data-type')).toBe('Button')
  })

  it('renders nothing meaningful when no adapter is provided', () => {
    const wrapper = mount(A2Renderer, {
      props: {
        component: { id: 'a', component: { Text: { text: 'x' } } },
        dataModel: {},
      },
    })
    expect(wrapper.find('.agentui-missing').exists()).toBe(true)
  })

  it('picks the first component-type key when the payload has more than one', () => {
    const adapter = makeAdapter({ Text: TextStub })
    const wrapper = mountWithAdapter({ id: 'a', component: { Text: { text: 'first' } } }, adapter)
    expect(wrapper.find('.stub-text').text()).toBe('first')
  })
})
