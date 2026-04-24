import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import type { A2UIDataModel } from '@berkantdev/agentui-core'
import { useDataModel, useDataModelSnapshot } from '../../src/composables/useDataModel.js'

describe('useDataModel', () => {
  it('returns the value at the given path', () => {
    const model = ref<A2UIDataModel>({ 'user.name': 'Ada' })
    const name = useDataModel<string>(model, 'user.name')
    expect(name.value).toBe('Ada')
  })

  it('is undefined for missing paths', () => {
    const model = ref<A2UIDataModel>({})
    const name = useDataModel<string>(model, 'nope')
    expect(name.value).toBeUndefined()
  })

  it('writes back through a new object reference', () => {
    const model = ref<A2UIDataModel>({ a: 1 })
    const prev = model.value
    const a = useDataModel<number>(model, 'a')
    a.value = 2
    expect(model.value).toEqual({ a: 2 })
    expect(model.value).not.toBe(prev)
  })
})

describe('useDataModelSnapshot', () => {
  it('returns the current data model', () => {
    const model = ref<A2UIDataModel>({ x: 1 })
    const snap = useDataModelSnapshot(model)
    expect(snap.value).toEqual({ x: 1 })
  })
})
