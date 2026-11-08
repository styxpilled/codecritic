import { asc, desc, eq, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { $db, toStringArr } from '#lib/server/db/index.ts';
import { query, getRequestEvent } from '$app/server';

const CACHE_TTL = 1000 * 60 * 5;
const cache = new Map<string, { expires: number; value: PopularPackage[] }>();

type PopularPackage = Awaited<ReturnType<typeof selectPopularPackages>>[number];

/** Only packages with at least one review count as popular. */
const selectPopularPackages = (limit: number, page: number) => {
	const { db } = getRequestEvent().locals;
	const sq = db
		.select({
			name: $db.reviews.packageID,
			popularity: sql<number>`count(*)`.as('popularity'),
		})
		.from($db.reviews)
		.groupBy($db.reviews.packageID)
		.orderBy(sql`count(*) DESC`, asc($db.reviews.packageID))
		.limit(limit)
		.offset(page * limit)
		.as('sq');
	return db
		.select({
			name: $db.packages.name,
			description: $db.packages.description,
			latest: $db.packages.latest,
			next: $db.packages.next,
			license: $db.packages.license,
			keywords: sql`json_group_array(DISTINCT packages_keywords.keyword)`
				.mapWith(toStringArr)
				.as('keywords'),
			popularity: sq.popularity,
		})
		.from(sq)
		.innerJoin($db.packages, eq($db.packages.name, sq.name))
		.leftJoin(
			$db.packagesKeywords,
			eq($db.packages.name, $db.packagesKeywords.name)
		)
		.groupBy($db.packages.name)
		.orderBy(desc(sq.popularity), asc($db.packages.name));
};

export const getPopularPackages = query(
	v.object({
		limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(18))),
		page: v.optional(
			v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(100))
		),
	}),
	async ({ limit = 9, page = 0 }) => {
		const key = `${limit}:${page}`;
		const cached = cache.get(key);
		if (cached && cached.expires > Date.now()) return cached.value;
		const value = await selectPopularPackages(limit, page);
		cache.set(key, { expires: Date.now() + CACHE_TTL, value });
		return value;
	}
);
