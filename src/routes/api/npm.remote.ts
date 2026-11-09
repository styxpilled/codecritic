import { error } from '@sveltejs/kit';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { $fetch } from '#lib';
import { $db, chunkRows, toStringArr } from '#lib/server/db/index.ts';
import { npmToDB } from '#lib/server/helpers.ts';
import type { NPMDirectPackage, NPMSearchResult } from '#lib/types.ts';
import { query, getRequestEvent } from '$app/server';

export const searchNPM = query(v.string(), async (query) => {
	if (query.length < 2) return [];
	const res = await $fetch<NPMSearchResult>(
		`https://registry.npmjs.org/-/v1/search?text=${query}&size=18`,
		null,
		fetch
	);
	if (res === null) error(500);
	res.objects.sort((a, b) => b.score.final - a.score.final);
	const fetchedPackages = res.objects.map((pkg) =>
		npmToDB(pkg.package as unknown as NPMDirectPackage)
	);
	return fetchedPackages;
});

export const getNPMPackage = query(v.string(), async (name) => {
	const { db } = getRequestEvent().locals;
	const [possiblePkg] = await db
		.select({
			...getTableColumns($db.packages),
			keywords: sql`json_group_array(DISTINCT packages_keywords.keyword)`
				.mapWith(toStringArr)
				.as('keywords'),
		})
		.from($db.packages)
		.leftJoin(
			$db.packagesKeywords,
			eq($db.packages.name, $db.packagesKeywords.name)
		)
		.where(eq($db.packages.name, name))
		.groupBy($db.packages.name);
	if (possiblePkg) {
		return possiblePkg;
	}
	const fetchFn = getRequestEvent().fetch;
	const npmPackage = await $fetch<NPMDirectPackage>(
		`https://registry.npmjs.org/${name}`,
		null,
		fetchFn
	);
	if (npmPackage === null) throw error(404);
	const pkg = npmToDB(npmPackage);
	await db
		.insert($db.packages)
		.values([{ ...pkg, expires: new Date() }])
		.onConflictDoNothing();
	const [first, ...rest] = chunkRows(
		pkg.keywords.map((keyword) => ({ name: pkg.name, keyword }))
	).map((rows) =>
		db.insert($db.packagesKeywords).values(rows).onConflictDoNothing()
	);
	if (first) await db.batch([first, ...rest]);

	if (npmPackage.readme) {
		await db
			.insert($db.readmes)
			.values([
				{
					name: pkg.name,
					url: pkg.repository,
					value: npmPackage.readme,
				},
			])
			.onConflictDoNothing();
	}
	return pkg;
});
