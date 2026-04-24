import { describe, expect, it } from 'vitest'
import type { ModuleOptions } from '../src/module.js'

describe('@berkantdev/agentui-nuxt module options', () => {
  it('accepts "default" as adapter', () => {
    const opts: ModuleOptions = { adapter: 'default' }
    expect(opts.adapter).toBe('default')
  })

  it('accepts "none" as adapter', () => {
    const opts: ModuleOptions = { adapter: 'none' }
    expect(opts.adapter).toBe('none')
  })

  it('allows omitting the adapter (defaults apply later)', () => {
    const opts: ModuleOptions = {}
    expect(opts.adapter).toBeUndefined()
  })
})
