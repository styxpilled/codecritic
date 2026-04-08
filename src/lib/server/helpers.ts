import type { NPMSearchPackage } from '$lib/types';
import type { Package } from './db/schema';

export const npmToDB = (pkg: NPMSearchPackage): Package => {
	return {
		name: pkg.name,
		description: pkg.description || '',
		keywords: pkg.keywords || [],
		latest: pkg['dist-tags']?.latest,
		next: pkg['dist-tags']?.next,
		license: pkg.license || '',
		repository: pkg?.repository?.url || '',
		homepage: pkg?.homepage || null,
		modified: pkg?.time?.modified,
	};
};

type Merge<A, B> = Omit<A, keyof B> & B;

export function parseColumn<Changes, T extends object>(
	data: T[],
	key: keyof T
): Expand<Merge<typeof data, Changes>[]>;
export function parseColumn<Changes, T extends object>(
	data: T,
	key: keyof T
): Expand<Merge<typeof data, Changes>>;
export function parseColumn<Changes, T>(data: T, key: keyof T) {
	if (Array.isArray(data)) {
		for (const el of data) {
			el[key] = JSON.parse(el[key]);
		}
	} else {
		// @ts-expect-error trust
		data[key] = JSON.parse(data[key]);
	}
	return data as Expand<Merge<typeof data, Changes>>[];
}
