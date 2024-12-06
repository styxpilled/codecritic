import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import * as schema from './schema';
import { packages, profiles, sessions, users, reviews, likesReviews } from './schema';

config({ path: '.env' }); // or .env.local

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });

export const $pg = {
	users,
	sessions,
	profiles,
	packages,
	reviews,
	likesReviews
};
