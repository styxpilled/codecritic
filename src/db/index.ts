import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { packages, profiles, sessions, users, reviews, likesReviews } from './schema';
import { DATABASE_URL } from '$env/static/private';

const sql = neon(DATABASE_URL);
export const db = drizzle({ client: sql, schema });

export const $pg = {
	users,
	sessions,
	profiles,
	packages,
	reviews,
	likesReviews
};
