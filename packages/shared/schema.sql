-- Perch Kitchen D1 schema.
-- Shared by the public site (writes) and the admin site (reads).
-- Apply from packages/www or packages/admin (each has the DB binding configured):
--   wrangler d1 execute perchkitchen-db --local  --file=../shared/schema.sql
--   wrangler d1 execute perchkitchen-db --remote --file=../shared/schema.sql

-- `data` holds the full submitted form as JSON, tagged with the `form_version` it was submitted
-- under (see src/lib/contact-form.ts) — this lets the contact form's fields change over time
-- without a migration for every change. `name`/`email` are denormalized into their own columns
-- for convenience (admin list, mailto links) but also appear in `data`.
CREATE TABLE IF NOT EXISTS inquiries (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	form_version INTEGER NOT NULL,
	name TEXT NOT NULL,
	email TEXT NOT NULL,
	data TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
