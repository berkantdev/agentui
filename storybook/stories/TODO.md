# Stories — TODO (next PR)

The Storybook currently ships 4 exemplary stories that demonstrate the
side-by-side default-vs-shadcn pattern. The next docs/stories PR should
fill in the remaining component coverage.

## Missing Default-adapter stories

- `Row.stories.ts` — gap variants, nested children
- `Column.stories.ts` — gap variants, nested children
- `TextField.stories.ts` — label + placeholder, disabled, bound value

## Placeholder coverage (default adapter falls back)

Stories that visualise the `[unmapped component]` placeholder for each
of the 14 uncovered types: `List`, `Tabs`, `Modal`, `Divider`, `Image`,
`Icon`, `Badge`, `Progress`, `Avatar`, `Alert`, `CheckBox`,
`ChoicePicker`, `Slider`.

## Live-SSE playground story

`playground/LiveDemo.stories.ts` that mocks a timed script of SSE
messages against `<A2Surface>` with a MockFetch shim, so visitors can
watch a surface build itself up exactly like the Nuxt playground's
`/live` page.

## Full shadcn-vue coverage

The four shadcn demo components in `storybook/components/ui/` cover the
most common four A2UI types. Add:

- `Separator` → A2UI.Divider
- `Badge` → A2UI.Badge
- `Progress` → A2UI.Progress
- `Avatar` → A2UI.Avatar
- `Alert` → A2UI.Alert
- `Tabs` → A2UI.Tabs
- `Checkbox` → A2UI.CheckBox
- `Select` → A2UI.ChoicePicker
- `Slider` → A2UI.Slider

Each new component takes a shadcn-vue source, re-themes the Tailwind
classes to match the `.sb-shadcn-*` convention (no Tailwind processor
in this Storybook — see `components/ui/README.md`), and gets a
matching `*.stories.ts` that reuses `SideBySide.vue`.

## Chromatic

`pnpm --filter @berkantdev/agentui-storybook chromatic` is wired; run it
once locally with `CHROMATIC_PROJECT_TOKEN` set to register the project,
then add the token to GitHub Secrets so CI picks it up.
