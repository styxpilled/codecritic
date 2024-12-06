import type { Handle } from '@sveltejs/kit';
import {
	deleteSessionTokenCookie,
	setSessionTokenCookie,
	validateSessionToken
} from '$lib/server/auth';
import { DATABASE_URL } from '$env/static/private';
import postgres from 'postgres';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session') || null;
	const sql = postgres(DATABASE_URL);

	event.locals.sql = sql;

	if (token === null) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await validateSessionToken(token);
	if (session !== null) {
		setSessionTokenCookie(event.cookies, session);
	} else {
		deleteSessionTokenCookie(event.cookies);
	}

	event.locals.session = session;
	event.locals.user = user;
	return resolve(event);
};
