# Security Policy

## Supported versions

We support the latest minor release of each published package:

- `@berkantdev/agentui-core`
- `@berkantdev/agentui-vue`
- `@berkantdev/agentui-nuxt`

Older majors receive patches only for severe vulnerabilities and only for
90 days after the next major ships.

## Reporting a vulnerability

**Please do not open public GitHub issues for suspected vulnerabilities.**
Instead, open a
[GitHub Security Advisory](https://github.com/berkantdev/agentui/security/advisories/new).
If that path isn't available to you, email the maintainers directly
(see the `author` field on the published npm packages).

We will acknowledge the report within 72 hours, investigate, and
coordinate a fix and disclosure timeline with you.

## Routine dependency audits

Contributors and maintainers should run `pnpm audit --audit-level=high`
before every release. CI fails the PR check on any `high` or `critical`
advisory against our dependency tree.
