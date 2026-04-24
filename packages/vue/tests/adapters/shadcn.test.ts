import { describe, expect, it } from 'vitest'
import { createShadcnAdapter } from '../../src/adapters/shadcn/index.js'

const FakeButton = { name: 'ShadcnButton', render: () => null }
const FakeDialog = { name: 'ShadcnDialog', render: () => null }
const FakeInput = { name: 'ShadcnInput', render: () => null }

describe('createShadcnAdapter', () => {
  it('maps supplied components under A2UI names', () => {
    const adapter = createShadcnAdapter({
      Button: FakeButton,
      Modal: FakeDialog,
      TextField: FakeInput,
    })
    expect(adapter.name).toBe('shadcn')
    expect(adapter.components.Button).toBe(FakeButton)
    expect(adapter.components.Modal).toBe(FakeDialog)
    expect(adapter.components.TextField).toBe(FakeInput)
  })

  it('leaves missing types undefined (renderer handles fallback)', () => {
    const adapter = createShadcnAdapter({ Button: FakeButton })
    expect(adapter.components.Slider).toBeUndefined()
  })

  it('propagates defaults', () => {
    const adapter = createShadcnAdapter({ Button: FakeButton }, { defaults: { locale: 'de' } })
    expect(adapter.defaults).toEqual({ locale: 'de' })
  })
})
