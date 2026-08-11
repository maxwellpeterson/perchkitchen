# Perch Kitchen

Marketing site for Perch Kitchen, a private chef business. This is a **pnpm workspace monorepo**
containing two independent projects, each deployed as its own Cloudflare Worker:

```text
pnpm-workspace.yaml
packages/
├── shared/                  non-code infrastructure shared by both packages
│   └── schema.sql           D1 schema — shared source of truth
├── www/                     public marketing site (Worker: perchkitchen)
│   ├── src/
│   │   ├── layouts/Layout.astro
│   │   ├── lib/contact-form.ts   Zod schema + versioned field config for the contact form
│   │   └── pages/
│   │       ├── index.astro       About / home
│   │       ├── contact.astro     Contact form
│   │       └── api/contact.ts    Form handler — validates and inserts into D1
│   └── wrangler.jsonc
└── admin/                   internal admin site (Worker: perchkitchen-admin)
    ├── src/
    │   ├── layouts/Layout.astro
    │   └── pages/index.astro     Lists submitted inquiries from D1
    └── wrangler.jsonc
```

Both Workers share one D1 database (`perchkitchen-db`) via a `DB` binding. The public site writes
contact form submissions to it; the admin site only reads from it. The admin site's own pages and
styling are static — its only real feature is the inquiries list, and it has no in-app
login. Access is restricted with **Cloudflare Access**, configured in the Cloudflare dashboard
(see below), not in application code.

## One-time setup

Install all dependencies for both packages from the repo root (do not run `pnpm install` inside a
package directory):

```sh
pnpm install
```

### Create the D1 database

```sh
wrangler login                                  # if not already authenticated
wrangler d1 create perchkitchen-db              # copy the printed database_id
```

Paste the resulting `database_id` into the `d1_databases` block of **both**
`packages/www/wrangler.jsonc` and `packages/admin/wrangler.jsonc`.

Apply the schema (from `packages/www`, which already has the `DB` binding configured):

```sh
cd packages/www
wrangler d1 execute perchkitchen-db --local  --persist-to=../../.wrangler/state --file=../shared/schema.sql
wrangler d1 execute perchkitchen-db --remote --file=../shared/schema.sql
```

Only apply schema changes once — both packages point at the same remote database.

After editing either `wrangler.jsonc`, regenerate that package's Worker types:

```sh
pnpm --filter www generate-types
pnpm --filter admin generate-types
```

## Development

Run each package's dev server from its own directory (see `AGENTS.md`/`CLAUDE.md` for the
background-mode convention), or use the root-level scripts:

```sh
pnpm dev:www     # or: cd packages/www && astro dev --background
pnpm dev:admin   # or: cd packages/admin && astro dev --background
```

Local D1 state **is shared** between the two packages: both `astro.config.mjs` files point the
Cloudflare adapter's `persistState` at the same `.wrangler/state` directory at the repo root, so
`dev:www` and `dev:admin` read and write the same local D1 simulation. That means a contact form
submitted via `dev:www` shows up immediately in the `dev:admin` inquiries list. Apply the schema
once, locally, from either package — pass `--persist-to` with the same path so the schema lands in
that shared directory rather than the (now unused) per-package default:

```sh
wrangler d1 execute perchkitchen-db --local --persist-to=../../.wrangler/state --file=../shared/schema.sql   # from packages/www or packages/admin
```

## Deploy

```sh
pnpm deploy:www     # builds and deploys the public Worker
pnpm deploy:admin   # builds and deploys the admin Worker
```

### Restrict the admin site with Cloudflare Access

After the admin Worker is deployed and (optionally) has a custom domain attached, go to the
Cloudflare dashboard → **Zero Trust** → **Access** → **Applications** → **Add an application**
(type: Self-hosted). Set the hostname to the admin Worker's route/domain, and add a policy
restricting access to your email address(es). This is a one-time, manual dashboard step — there is
no code-based login in the admin app itself.

## Editing content

- Chef bio, philosophy, and photos: `packages/www/src/pages/index.astro` (marked with `TODO` comments).
- Contact form fields: `packages/www/src/lib/contact-form.ts` (see the comment at the top for how
  versioning works across form changes).
- Site-wide colors/fonts/header/footer: `packages/www/src/layouts/Layout.astro`.
