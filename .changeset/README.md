# Changesets

This folder holds **changesets** — one markdown file per merged change,
describing what shipped and why. At release time they are aggregated
into `CHANGELOG.md` files and used to bump package versions independently.

## Adding a changeset

After editing code, run:

```bash
pnpm changeset
```

Pick the package(s) you changed, pick `patch` / `minor` / `major`, and
write a short summary. The tool creates a new markdown file in this
folder — commit it alongside your code change.

## Versioning policy

Each published package (`@berkantdev/agentui-core`, `@berkantdev/agentui-vue`,
`@berkantdev/agentui-nuxt`) is versioned **independently**. We follow
semver strictly:

- **patch** — internal refactors, bug fixes, doc-only changes
- **minor** — new optional APIs, backward-compatible additions
- **major** — any breaking change (removed/renamed export, changed
  signature, changed runtime behaviour, bumped peer-dep range)

Internal workspace dependencies (`"@berkantdev/agentui-vue"` depending on
`"@berkantdev/agentui-core"`) get a `patch` bump automatically when the
upstream package changes.

## Releasing

On merge to `main`, the release GitHub Action opens a "Version Packages"
PR. Merging that PR triggers `pnpm changeset publish`, which:

1. Applies every pending changeset to the affected package versions.
2. Updates each package's `CHANGELOG.md`.
3. Publishes the bumped packages to npm under `@berkantdev/*`.

## Writing a good changeset

Describe **what changed and why**, not just *what* — the entries land in
user-facing changelogs. Prefer:

> Fix `useSSE` reconnect loop leaking timers on unmount — closes #42.

over:

> Fix bug in useSSE.

For breaking changes, include a short migration snippet in the body so
downstream users see the fix without opening an issue.
