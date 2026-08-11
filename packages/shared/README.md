# shared

Infrastructure shared by `packages/www` and `packages/admin` that isn't code for either one
specifically — currently just `schema.sql`, the D1 schema both packages' `wrangler.jsonc` point
at via the same `database_id`.

This package has no dependencies and nothing to install or build; it exists so shared,
non-package-specific files have an obvious home in the workspace. Apply the schema by running
`wrangler` from `packages/www` or `packages/admin` (each already has the `DB` binding configured)
with a relative path to this file — see the root `README.md` for the exact commands.
