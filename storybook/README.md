# `@berkantdev/agentui-storybook`

Visual regression + component playground for AgentUI. Renders every
story with the **default adapter** and the **shadcn adapter** side by
side so the two paths never silently diverge.

## Scripts

```bash
pnpm --filter @berkantdev/agentui-storybook dev        # local dev on :6006
pnpm --filter @berkantdev/agentui-storybook build      # static build → storybook-static/
pnpm --filter @berkantdev/agentui-storybook chromatic  # visual diff on Chromatic
```

## Directory layout

```
storybook/
├── .storybook/          # Storybook config (main.ts, preview.ts, preview.css)
├── components/ui/       # shadcn-vue copy-paste components (see README there)
├── lib/utils.ts         # cn() helper, same as shadcn-vue
├── stories/
│   ├── SideBySide.vue   # the shared "default | shadcn" split-view shell
│   ├── adapters.ts      # pre-built default + shadcn adapter instances
│   ├── components/      # one *.stories.ts per component type
│   └── TODO.md          # remaining coverage for the next docs PR
└── chromatic.config.json
```

## What ships today (phase 1)

Four exemplary stories that establish the side-by-side pattern:

- `Components/Text` — body / heading / caption variants
- `Components/Button` — default / disabled / destructive
- `Components/Card` — with and without a title
- `Components/A2StaticRenderer` — a composite surface and an
  unmapped-component fallback demo

The `stories/TODO.md` file tracks the remaining coverage (14 uncovered
A2UI types, more variants, a live-SSE story, extended shadcn components).

## Chromatic deployment

1. Create a project on [chromatic.com](https://www.chromatic.com) — pick
   the GitHub repository and copy the project token.
2. Fill `storybook/chromatic.config.json`'s `projectId` with the token
   (or export `CHROMATIC_PROJECT_TOKEN` in your shell), then run
   `pnpm --filter @berkantdev/agentui-storybook chromatic` once locally.
3. Add `CHROMATIC_PROJECT_TOKEN` as a GitHub repository secret so the
   CI workflow (see `.github/workflows/`) can post diffs on every PR.

## shadcn-vue components in this Storybook

The shadcn components under `components/ui/` are **hand-styled copies**
with shadcn-vue's API but plain CSS classes — the Storybook doesn't run
Tailwind. Production projects that vendor the real shadcn-vue sources
should keep the Tailwind classes and drop the `.sb-shadcn-*` theme.
