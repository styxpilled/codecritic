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
