/**
 * Re-exports every composable from `@berkantdev/agentui-vue` so Nuxt's
 * auto-import scanner picks them up as first-class imports.
 *
 * Consumers write `const surface = useSurface()` with no explicit import.
 */
export {
  useA2UI,
  useSSE,
  useSurface,
  useDataModel,
  useDataModelSnapshot,
} from '@berkantdev/agentui-vue'
