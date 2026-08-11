import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { ContactFormSchema, CONTACT_FORM_VERSION } from '../../lib/contact-form';

export const prerender = false;

export const POST: APIRoute = async (context) => {
	const form = await context.request.formData();

	// Honeypot: real visitors never fill this hidden field in. Bots often do.
	// Pretend success so the bot doesn't learn anything, but don't store it.
	if (form.get('company')) {
		return context.redirect('/contact?success=1');
	}

	// Zod validates and types the submission in one step; unknown keys (like the honeypot
	// above) are stripped automatically since ContactFormSchema doesn't declare them.
	const parsed = ContactFormSchema.safeParse(Object.fromEntries(form));
	if (!parsed.success) {
		return context.redirect('/contact?error=1');
	}
	const values = parsed.data;

	// "name"/"email" are denormalized into their own columns for the admin list and mailto
	// links; the full submission is kept as a versioned JSON blob so the form's fields can
	// evolve without a schema migration for every change.
	await env.DB
		.prepare('INSERT INTO inquiries (form_version, name, email, data) VALUES (?, ?, ?, ?)')
		.bind(CONTACT_FORM_VERSION, values.name, values.email, JSON.stringify(values))
		.run();

	return context.redirect('/contact?success=1');
};
