# shadcn-vue components (copy-paste)

These four components were copied from [shadcn-vue](https://www.shadcn-vue.com)
and trimmed for the Storybook environment:

- `button` — based on `ui/button`
- `card` — based on `ui/card`
- `dialog` — based on `ui/dialog` (uses `radix-vue` under the hood)
- `input` — based on `ui/input`

**The upstream shadcn-vue components ship with Tailwind classes.** This
Storybook doesn't run Tailwind, so the shipped classes are replaced with
hand-written CSS namespaced under `.sb-shadcn-*`. The component *API*
(props, slots, events) is unchanged — consumers who paste these into
their own Tailwind-powered projects should replace the styles with the
real shadcn-vue sources.

The shadcn adapter in `@berkantdev/agentui-vue/adapters` is agnostic: it
accepts whatever Vue components the user hands it, so it works with
these demo copies and with the real shadcn-vue originals alike.
