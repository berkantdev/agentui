import { describe, expect, it } from 'vitest'
import { useSurface } from '../../src/composables/useSurface.js'

describe('useSurface.applyMessage', () => {
  it('initialises state on createSurface', () => {
    const s = useSurface()
    s.applyMessage({ type: 'createSurface', surfaceId: 's1', title: 'Hi' })
    expect(s.surfaceId.value).toBe('s1')
    expect(s.title.value).toBe('Hi')
    expect(s.components.value.size).toBe(0)
    expect(s.dataModel.value).toEqual({})
  })

  it('wipes state on a new createSurface for the same id', () => {
    const s = useSurface()
    s.applyMessage({ type: 'createSurface', surfaceId: 's1' })
    s.applyMessage({
      type: 'updateComponents',
      surfaceId: 's1',
      components: [{ id: 'a', component: { Text: { text: 'x' } } }],
    })
    s.applyMessage({ type: 'createSurface', surfaceId: 's1' })
    expect(s.components.value.size).toBe(0)
  })

  it('stores components on updateComponents', () => {
    const s = useSurface()
    s.applyMessage({ type: 'createSurface', surfaceId: 's1' })
    s.applyMessage({
      type: 'updateComponents',
      surfaceId: 's1',
      components: [
        { id: 'a', component: { Text: { text: 'hi' } } },
        { id: 'b', component: { Button: { label: 'Go' } } },
      ],
    })
    expect(s.components.value.size).toBe(2)
    expect(s.components.value.get('a')?.component.Text).toEqual({ text: 'hi' })
  })

  it('upserts components by id on repeated updateComponents', () => {
    const s = useSurface()
    s.applyMessage({ type: 'createSurface', surfaceId: 's1' })
    s.applyMessage({
      type: 'updateComponents',
      surfaceId: 's1',
      components: [{ id: 'a', component: { Text: { text: 'one' } } }],
    })
    s.applyMessage({
      type: 'updateComponents',
      surfaceId: 's1',
      components: [{ id: 'a', component: { Text: { text: 'two' } } }],
    })
    expect(s.components.value.size).toBe(1)
    expect(s.components.value.get('a')?.component.Text).toEqual({ text: 'two' })
  })

  it('merges data on updateDataModel', () => {
    const s = useSurface()
    s.applyMessage({ type: 'createSurface', surfaceId: 's1' })
    s.applyMessage({
      type: 'updateDataModel',
      surfaceId: 's1',
      data: { 'user.name': 'Ada' },
    })
    s.applyMessage({
      type: 'updateDataModel',
      surfaceId: 's1',
      data: { 'user.age': 36 },
    })
    expect(s.dataModel.value).toEqual({ 'user.name': 'Ada', 'user.age': 36 })
  })

  it('resets on deleteSurface', () => {
    const s = useSurface()
    s.applyMessage({ type: 'createSurface', surfaceId: 's1' })
    s.applyMessage({
      type: 'updateComponents',
      surfaceId: 's1',
      components: [{ id: 'a', component: { Text: { text: 'x' } } }],
    })
    s.applyMessage({ type: 'deleteSurface', surfaceId: 's1' })
    expect(s.surfaceId.value).toBeNull()
    expect(s.components.value.size).toBe(0)
    expect(s.dataModel.value).toEqual({})
  })

  it('ignores messages targeting a different surfaceId', () => {
    const s = useSurface()
    s.applyMessage({ type: 'createSurface', surfaceId: 's1' })
    s.applyMessage({
      type: 'updateComponents',
      surfaceId: 'other',
      components: [{ id: 'a', component: { Text: { text: 'nope' } } }],
    })
    expect(s.components.value.size).toBe(0)
  })

  it('accepts any updateComponents before createSurface (no surfaceId yet)', () => {
    const s = useSurface()
    s.applyMessage({
      type: 'updateComponents',
      surfaceId: 'anything',
      components: [{ id: 'a', component: { Text: { text: 'hi' } } }],
    })
    expect(s.components.value.size).toBe(1)
  })
})
