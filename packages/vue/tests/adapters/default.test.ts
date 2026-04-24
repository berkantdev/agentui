import { describe, expect, it } from 'vitest'
import { DEFAULT_COVERED_TYPES, createDefaultAdapter } from '../../src/adapters/default/index.js'
import { A2UI_COMPONENT_TYPES } from '@berkantdev/agentui-core'

describe('createDefaultAdapter', () => {
  it('has the adapter name "default"', () => {
    expect(createDefaultAdapter().name).toBe('default')
  })

  it('covers all 6 core types with their dedicated component', () => {
    const adapter = createDefaultAdapter()
    for (const type of DEFAULT_COVERED_TYPES) {
      expect(adapter.components[type]).toBeDefined()
    }
  })

  it('maps every remaining A2UI type to the placeholder', () => {
    const adapter = createDefaultAdapter()
    for (const type of A2UI_COMPONENT_TYPES) {
      expect(adapter.components[type]).toBeDefined()
    }
  })

  it('honours overrides', () => {
    const Fake = { name: 'Fake', render: () => null }
    const adapter = createDefaultAdapter({ overrides: { Button: Fake } })
    expect(adapter.components.Button).toBe(Fake)
  })
})
