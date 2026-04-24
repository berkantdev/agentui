import { describe, expect, it } from 'vitest'
import {
  A2UIComponentSchema,
  A2UIComponentTypeSchema,
  A2UIDataModelSchema,
  A2UIMessageSchema,
} from '../src/schema/index.js'
import { A2UI_COMPONENT_TYPES } from '../src/types/index.js'

describe('A2UIComponentTypeSchema', () => {
  it('accepts every declared component type', () => {
    for (const t of A2UI_COMPONENT_TYPES) {
      expect(A2UIComponentTypeSchema.safeParse(t).success).toBe(true)
    }
  })

  it('rejects an unknown component type', () => {
    expect(A2UIComponentTypeSchema.safeParse('NotAComponent').success).toBe(false)
  })
})

describe('A2UIComponentSchema', () => {
  it('accepts a valid component', () => {
    const result = A2UIComponentSchema.safeParse({
      id: 'btn-1',
      component: { Button: { label: 'OK' } },
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty id', () => {
    const result = A2UIComponentSchema.safeParse({
      id: '',
      component: { Button: { label: 'OK' } },
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing component field', () => {
    const result = A2UIComponentSchema.safeParse({ id: 'x' })
    expect(result.success).toBe(false)
  })

  it('rejects unknown component-type key', () => {
    const result = A2UIComponentSchema.safeParse({
      id: 'x',
      component: { Bogus: {} },
    })
    expect(result.success).toBe(false)
  })
})

describe('A2UIDataModelSchema', () => {
  it('accepts an empty data model', () => {
    expect(A2UIDataModelSchema.safeParse({}).success).toBe(true)
  })

  it('accepts mixed value types', () => {
    const result = A2UIDataModelSchema.safeParse({
      'user.name': 'Ada',
      'cart.count': 3,
      'is.active': true,
    })
    expect(result.success).toBe(true)
  })
})

describe('A2UIMessageSchema', () => {
  it('accepts createSurface with title', () => {
    const r = A2UIMessageSchema.safeParse({
      type: 'createSurface',
      surfaceId: 's1',
      title: 'Welcome',
    })
    expect(r.success).toBe(true)
  })

  it('accepts createSurface without title', () => {
    const r = A2UIMessageSchema.safeParse({
      type: 'createSurface',
      surfaceId: 's1',
    })
    expect(r.success).toBe(true)
  })

  it('accepts updateComponents', () => {
    const r = A2UIMessageSchema.safeParse({
      type: 'updateComponents',
      surfaceId: 's1',
      components: [{ id: 'a', component: { Text: { text: 'hi' } } }],
    })
    expect(r.success).toBe(true)
  })

  it('accepts updateDataModel', () => {
    const r = A2UIMessageSchema.safeParse({
      type: 'updateDataModel',
      surfaceId: 's1',
      data: { 'foo.bar': 42 },
    })
    expect(r.success).toBe(true)
  })

  it('accepts deleteSurface', () => {
    const r = A2UIMessageSchema.safeParse({
      type: 'deleteSurface',
      surfaceId: 's1',
    })
    expect(r.success).toBe(true)
  })

  it('rejects an unknown message type', () => {
    const r = A2UIMessageSchema.safeParse({
      type: 'noSuchType',
      surfaceId: 's1',
    })
    expect(r.success).toBe(false)
  })

  it('rejects a missing surfaceId', () => {
    const r = A2UIMessageSchema.safeParse({ type: 'deleteSurface' })
    expect(r.success).toBe(false)
  })

  it('rejects an empty surfaceId', () => {
    const r = A2UIMessageSchema.safeParse({
      type: 'deleteSurface',
      surfaceId: '',
    })
    expect(r.success).toBe(false)
  })
})
