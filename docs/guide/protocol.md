# A2UI Protocol

<!-- TODO(docs-phase-2): A2UI v0.10 protocol reference
  - Overview: surfaces, components, data model
  - Message types (createSurface / updateComponents / updateDataModel / deleteSurface)
    with example JSON payloads and the lifecycle they describe
  - Component catalog — all 20 component types with their well-known props
  - Data model semantics: dotted paths, two-way binding from input components,
    how AgentUI's useDataModel composable wraps them
  - Surface addressing when multiple surfaces share a connection
  - v0.8 → v0.10 differences (and where the legacy type alias lives)
  - Backend authoring: minimal Node agent example streaming SSE
-->

::: info Placeholder
This page is intentionally minimal. The full protocol reference is
scheduled for the next documentation PR.

For now, the [`@berkantdev/agentui-core` source](https://github.com/berkantdev/agentui/tree/main/packages/core/src/types)
is authoritative — every message type is defined as a TypeScript
interface with JSDoc, mirrored one-to-one in the Zod schemas. Start
with `protocol.ts` for the four message shapes, `components.ts` for
the 20 component-type union.
:::
