import { error, invalid, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import {
	deleteSessionTokenCookie,
	deleteUser,
	invalidateSession,
	invalidateUserSessions,
} from '#lib/server/auth.ts';
import { $db } from '#lib/server/db/index.ts';
import { form, getRequestEvent, query } from '$app/server';
import { confirmUsernameSchema } from './schemas';

/** Sessions of the signed in user. The current one comes first. */
export const getSessions = query(async () => {
	const { db, user, session } = getRequestEvent().locals;
	if (!user) error(401);
	const sessions = await db
		.select({ id: $db.sessions.id, createdAt: $db.sessions.createdAt })
		.from($db.sessions)
		.where(eq($db.sessions.userID, user.id))
		.orderBy(asc($db.sessions.createdAt));
	return sessions.map((s) => ({
		createdAt: new Date(s.createdAt * 1000),
		current: s.id === session?.id,
	}));
});

export const signOut = form(async () => {
	const { cookies, locals } = getRequestEvent();
	if (locals.session) await invalidateSession(locals.db, locals.session.id);
	deleteSessionTokenCookie(cookies);
	redirect(303, '/');
});

export const signOutEverywhere = form(async () => {
	const { cookies, locals } = getRequestEvent();
	if (!locals.user) error(401);
	await invalidateUserSessions(locals.db, locals.user.id);
	deleteSessionTokenCookie(cookies);
	redirect(303, '/');
});

export const deleteAccount = form(
	confirmUsernameSchema,
	async ({ confirm }, issue) => {
		const { cookies, locals } = getRequestEvent();
		if (!locals.user) error(401);
		if (confirm !== locals.user.username) {
			invalid(issue.confirm('Type your username to confirm.'));
		}
		await deleteUser(locals.db, locals.user.id);
		deleteSessionTokenCookie(cookies);
		redirect(303, '/');
	}
);
