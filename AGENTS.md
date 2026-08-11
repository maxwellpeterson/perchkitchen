## Project layout

This is a pnpm workspace monorepo containing two independent Astro + Cloudflare Workers projects, deployed separately, plus a non-code shared package:

- `packages/www` — the public marketing site (Worker `perchkitchen`).
- `packages/admin` — the internal admin site that lists contact form inquiries (Worker `perchkitchen-admin`). Access is gated by Cloudflare Access, configured in the Cloudflare dashboard — there is no in-app login.
- `packages/shared` — infrastructure shared by the other two, currently just `schema.sql`. It has no dependencies and isn't imported by any package's code.

Both `www` and `admin` share one D1 database (`perchkitchen-db`, bound as `DB` in each package's `wrangler.jsonc`). The schema lives at `packages/shared/schema.sql` — it's the single source of truth; only apply it once (from either `www` or `admin`, via a relative path — see `packages/shared/README.md`), since both wrangler configs point at the same remote database. After changing `wrangler.jsonc` in either package, re-run `wrangler types` (`pnpm --filter www generate-types` / `pnpm --filter admin generate-types`) to refresh that package's `worker-configuration.d.ts`.

Install all dependencies once from the repo root with `pnpm install` — do not run `npm install`/`pnpm install` inside a package directory.

## Development

Each package has its own dev server and background-process state, tracked per working directory. Run commands from the correct package directory (`packages/www` for the public site, `packages/admin` for the admin site), or use the root-level `pnpm dev:www` / `pnpm dev:admin` scripts. Use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs` (run from the same directory as the corresponding `astro dev --background`).

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
