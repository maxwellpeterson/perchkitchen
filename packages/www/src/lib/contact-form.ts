import { z } from 'zod';

/**
 * The Contact page form fields, defined once and versioned.
 *
 * `ContactFormSchema` is the single source of truth for validation and the resulting
 * `ContactFormValues` type — the API handler parses submissions with it. `CONTACT_FORM_FIELDS`
 * is separate, presentation-only metadata (label, input type, order) that drives the rendered
 * form; keep the two in sync when you add/remove/rename a field.
 *
 * Every submission is stored with the CONTACT_FORM_VERSION it was submitted under, plus the
 * full set of submitted values as a JSON blob (see `inquiries.data` in
 * packages/shared/schema.sql). That means
 * the form can change over time without a database migration for every change — older
 * submissions stay readable in their original shape, tagged with the version they came from,
 * and the admin site renders whatever fields are present generically.
 *
 * Bump CONTACT_FORM_VERSION whenever you change the schema below. Keep the "name" and "email"
 * fields present and named as-is — the API handler denormalizes those two into their own D1
 * columns for the admin list and mailto links.
 */

export const CONTACT_FORM_VERSION = 1;

export const ContactFormSchema = z.object({
	name: z.string().trim().min(1, 'Please enter your name.'),
	email: z.string().trim().pipe(z.email('Please enter a valid email address.')),
	phone: z
		.string()
		.trim()
		.optional()
		.transform((value) => (value ? value : null)),
	message: z.string().trim().min(1, 'Please enter a message.')
});

export type ContactFormValues = z.infer<typeof ContactFormSchema>;

export interface ContactField {
	name: keyof ContactFormValues;
	label: string;
	type: 'text' | 'email' | 'tel' | 'textarea';
	required: boolean;
}

export const CONTACT_FORM_FIELDS: ContactField[] = [
	{ name: 'name', label: 'Name', type: 'text', required: true },
	{ name: 'email', label: 'Email', type: 'email', required: true },
	{ name: 'phone', label: 'Phone', type: 'tel', required: false },
	{ name: 'message', label: 'Message', type: 'textarea', required: true }
];
