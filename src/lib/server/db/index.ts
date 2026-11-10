import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDb(db?: D1Database): ReturnType<typeof drizzle> {
	if (db) {
		return drizzle(db, { schema });
	}
	throw new Error('No database configuration found');
}

export type DrizzleClient = ReturnType<typeof getDb>;
export const $db = schema;

export const toStringArr = {
	mapFromDriverValue: (value: string): string[] => {
		const mappedValue = value;
		// mapping you want to apply
		return JSON.parse(mappedValue);
	},
};

/** Splits rows so that each insert stays below the D1 limit of 100 bound parameters. */
export const chunkRows = <T extends object>(rows: T[]): T[][] => {
	if (!rows.length) return [];
	const size = Math.floor(100 / Object.keys(rows[0]).length);
	return Array.from({ length: Math.ceil(rows.length / size) }, (_, i) =>
		rows.slice(i * size, (i + 1) * size)
	);
};

/** Whether the signed in user likes the selected review. */
export const reviewLikedFlag = (viewerID: number) =>
	sql`EXISTS (SELECT 1 FROM likes_reviews WHERE review_id = ${schema.reviews.id} AND user_id = ${viewerID})`.mapWith(
		Boolean
	);
