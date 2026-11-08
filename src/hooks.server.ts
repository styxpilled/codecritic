import type { Handle } from '@sveltejs/kit/hooks';
import { env } from 'cloudflare:workers';
import {
	CODECRITIC_SESSION_COOKIE,
	deleteSessionTokenCookie,
	validateSessionToken,
} from '#lib/server/auth.ts';
import { getDb } from '#lib/server/db/index.ts';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.db = getDb(env.codecritic_d1);
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
	event.locals.session = session;
	return resolve(event);
};
