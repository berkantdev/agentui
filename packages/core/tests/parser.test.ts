import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parseComponent, parseMessage } from '../src/parser/index.js'

describe('parseMessage', () => {
  let warn: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    warn.mockRestore()
  })

  it('parses a valid createSurface message', () => {
    const msg = parseMessage('{"type":"createSurface","surfaceId":"s1","title":"Hi"}')
    expect(msg).not.toBeNull()
    expect(msg?.type).toBe('createSurface')
    if (msg?.type === 'createSurface') {
      expect(msg.surfaceId).toBe('s1')
      expect(msg.title).toBe('Hi')
    }
  })

  it('parses updateComponents', () => {
    const msg = parseMessage(
      JSON.stringify({
        type: 'updateComponents',
        surfaceId: 's1',
        components: [{ id: 'a', component: { Text: { text: 'hi' } } }],
      }),
    )
    expect(msg?.type).toBe('updateComponents')
  })

  it('parses updateDataModel', () => {
    const msg = parseMessage(
      JSON.stringify({
        type: 'updateDataModel',
        surfaceId: 's1',
        data: { 'x.y': 1 },
      }),
    )
    expect(msg?.type).toBe('updateDataModel')
  })

  it('parses deleteSurface', () => {
    const msg = parseMessage('{"type":"deleteSurface","surfaceId":"s1"}')
    expect(msg?.type).toBe('deleteSurface')
  })

  it('returns null and does not throw on invalid JSON', () => {
    expect(parseMessage('{not json')).toBeNull()
    expect(warn).not.toHaveBeenCalled()
  })

  it('returns null and warns on schema mismatch', () => {
    expect(parseMessage('{"type":"wat"}')).toBeNull()
    expect(warn).toHaveBeenCalledOnce()
  })

  it('returns null for empty string', () => {
    expect(parseMessage('')).toBeNull()
  })

  it('returns null for non-object JSON', () => {
    expect(parseMessage('"just a string"')).toBeNull()
    expect(parseMessage('42')).toBeNull()
    expect(parseMessage('null')).toBeNull()
  })
})

describe('parseComponent', () => {
  it('parses a valid component object', () => {
    const c = parseComponent({ id: 'btn', component: { Button: { label: 'Go' } } })
    expect(c).not.toBeNull()
    expect(c?.id).toBe('btn')
  })

  it('parses a valid component from string', () => {
    const c = parseComponent('{"id":"btn","component":{"Button":{"label":"Go"}}}')
    expect(c?.id).toBe('btn')
  })

  it('returns null for invalid JSON string', () => {
    expect(parseComponent('nope')).toBeNull()
  })

  it('returns null for invalid shape', () => {
    expect(parseComponent({ id: 'x' })).toBeNull()
    expect(parseComponent({ id: '', component: { Button: {} } })).toBeNull()
  })
})
