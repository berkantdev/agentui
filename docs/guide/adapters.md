# Adapters

<!-- TODO(docs-phase-2): Adapters deep-dive
  - What an adapter is (mapping A2UI component types → Vue components)
  - Using the built-in default adapter (coverage + placeholder fallback)
  - Building a shadcn-vue adapter via createShadcnAdapter (full mapping table)
  - Building a custom adapter from scratch via createAdapter<Component>
  - Overrides (partial replacement of a base adapter's components)
  - Adapter defaults (locale, dateFormat) and how components read them
  - Runtime-swapping adapters via provide/inject on a subtree
  - Testing adapters with A2StaticRenderer
-->

::: info Placeholder
This page is intentionally minimal. The full adapters guide is scheduled
for the next documentation PR.

In the meantime, see **[Getting Started → Using shadcn-vue
components](./getting-started#using-shadcn-vue-components)** for the
quickest path to a working custom adapter, and the JSDoc on
[`createAdapter`](../api/core) and
[`createShadcnAdapter`](../api/vue) for the full option surface.
:::
