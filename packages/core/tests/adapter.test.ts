import { describe, expect, it } from 'vitest'
import { createAdapter, defaultAdapter } from '../src/adapter/index.js'

type Fake = { kind: string }
const A: Fake = { kind: 'A' }
const B: Fake = { kind: 'B' }
const C: Fake = { kind: 'C' }

describe('createAdapter', () => {
  it('keeps base components when no overrides given', () => {
    const adapter = createAdapter('t', { Button: A, Text: B })
    expect(adapter.name).toBe('t')
    expect(adapter.components.Button).toBe(A)
    expect(adapter.components.Text).toBe(B)
  })

  it('applies overrides on top of base components', () => {
    const adapter = createAdapter('t', { Button: A, Text: B }, { overrides: { Button: C } })
    expect(adapter.components.Button).toBe(C)
    expect(adapter.components.Text).toBe(B)
  })

  it('does not mutate the base map', () => {
    const base = { Button: A }
    createAdapter('t', base, { overrides: { Text: B } })
    expect(base).toEqual({ Button: A })
  })

  it('omits `defaults` when none are passed (exactOptionalPropertyTypes)', () => {
    const adapter = createAdapter('t', { Button: A })
    expect('defaults' in adapter).toBe(false)
  })

  it('preserves defaults when passed', () => {
    const adapter = createAdapter(
      't',
      { Button: A },
      { defaults: { locale: 'de', dateFormat: 'DD.MM.YYYY' } },
    )
    expect(adapter.defaults).toEqual({ locale: 'de', dateFormat: 'DD.MM.YYYY' })
  })
})

describe('defaultAdapter', () => {
  it('is a valid, empty adapter', () => {
    expect(defaultAdapter.name).toBe('default')
    expect(Object.keys(defaultAdapter.components)).toHaveLength(0)
  })
})
