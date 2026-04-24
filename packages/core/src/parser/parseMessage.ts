import { A2UIMessageSchema } from '../schema/protocol.schema.js'
import type { A2UIMessage } from '../types/protocol.js'

/**
 * Parses a single raw A2UI v0.10 message string (typically one SSE
 * `data:` payload) into a typed, validated {@link A2UIMessage}.
 *
 * Returns `null` for malformed JSON or messages that do not conform to
 * the v0.10 schema. The function never throws — SSE streams can contain
 * noise and we fail soft.
 *
 * @example
 * const msg = parseMessage('{"type":"createSurface","surfaceId":"s1"}')
 * if (msg) console.log(msg.surfaceId) // 's1'
 */
export function parseMessage(raw: string): A2UIMessage | null {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return null
  }

  const result = A2UIMessageSchema.safeParse(json)
  if (!result.success) {
    if (typeof console !== 'undefined' && typeof console.warn === 'function') {
      console.warn('[agentui] Invalid A2UI message:', result.error.flatten())
    }
    return null
  }

  return result.data as A2UIMessage
}
