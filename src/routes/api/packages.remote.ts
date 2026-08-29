import { eq, getTableColumns, sql, desc } from 'drizzle-orm';
import * as v from 'valibot';
import { query, getRequestEvent } from '$app/server';
import { $db, toStringArr } from '$lib/server/db';

export const getPopularPackages = query(
	v.object({
		limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(18))),
		page: v.optional(v.number()),
	}),
	async ({ limit = 9, page = 0 }) => {
		const { db } = getRequestEvent().locals;
		const sq = db
			.select({
				...getTableColumns($db.packages),
				popularity: sql<number>`count(${$db.reviews.id})`.as('popularity'),
			})
			.from($db.packages)
			.leftJoin($db.reviews, eq($db.packages.name, $db.reviews.packageID))
			.groupBy($db.packages.name)
			.orderBy(sql`COUNT(${$db.reviews.id}) DESC`)
			.limit(limit)
			.offset(page * limit)
			.as('sq');
		const packages = await db
			.select({
				name: sq.name,
				description: sq.description,
				latest: sq.latest,
				next: sq.next,
				license: sq.license,
				keywords: sql`json_group_array(DISTINCT packages_keywords.keyword)`
					.mapWith(toStringArr)
					.as('keywords'),
				popularity: sq.popularity,
			})
			.from(sq)
			.leftJoin($db.packagesKeywords, eq(sq.name, $db.packagesKeywords.name))
			.groupBy(sq.name)
			.orderBy(desc(sq.popularity));
		return packages;
	}
);
