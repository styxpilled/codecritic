// import { lucia } from '$lib/server/lucia';
import { dev } from '$app/environment';
import { Lucia } from 'lucia';
import postgres from 'postgres';
import { PostgresJsAdapter } from '@lucia-auth/adapter-postgresql';
import { DATABASE_URL } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sql = postgres(DATABASE_URL);

	const adapter = new PostgresJsAdapter(sql, {
		user: 'users',
		session: 'user_session'
	});

	const lucia = new Lucia(adapter, {
		sessionCookie: {
			attributes: {
				// set to `true` when using HTTPS
				secure: !dev
			}
		},
		getUserAttributes: (attributes) => {
			return {
				githubId: attributes.github_id,
				username: attributes.username,
				nickname: attributes.nickname
			};
		}
	});

	event.locals.sql = sql;
	event.locals.lucia = lucia;

	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		// sveltekit types deviates from the de-facto standard
		// you can use 'as any' too
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};
