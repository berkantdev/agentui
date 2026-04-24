import type { AgentUIAdapter } from '../types/adapter.js'

/**
 * A built-in, framework-agnostic no-op adapter.
 *
 * Useful as a safe fallback (e.g. in tests, or when no adapter has been
 * registered yet). It resolves no components, so renderers should treat
 * every component as "unmapped" and render a placeholder.
 */
export const defaultAdapter: AgentUIAdapter = {
  name: 'default',
  components: {},
}
