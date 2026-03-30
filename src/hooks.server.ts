import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/db';
// import { building } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.db = getDb(event.platform?.env.codecritic_d1, env.DATABASE_URL);
	return resolve(event);
};
