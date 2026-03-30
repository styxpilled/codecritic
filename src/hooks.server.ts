import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/db';
import {
	CODECRITIC_SESSION_COOKIE,
	deleteSessionTokenCookie,
	validateSessionToken
} from '$lib/server/auth';
// import { building } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.db = getDb(event.platform?.env.codecritic_d1, env.DATABASE_URL);
	const token = event.cookies.get(CODECRITIC_SESSION_COOKIE) || null;

	if (token === null) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await validateSessionToken(event.locals.db, token);
	if (session !== null) {
		// setSessionTokenCookie(event.cookies, session);
	} else {
		deleteSessionTokenCookie(event.cookies);
	}
	event.locals.user = user;
	return resolve(event);
};
