import { error } from '@sveltejs/kit';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { query, getRequestEvent } from '$app/server';
import { $fetch, toPackageName } from '$lib';
import { $db } from '$lib/server/db';
import { npmToDB, parseColumn } from '$lib/server/helpers';
import type { NPMSearchPackage } from '$lib/types';

type NPMSearchResults = { objects: { package: NPMSearchPackage; score: { final: number } }[] };

export const searchNPM = query(v.string(), async (query) => {
	const res = await $fetch<NPMSearchResults>(
		`https://registry.npmjs.org/-/v1/search?text=${query}&size=50`,
		null,
		fetch
	);
	if (res === null) error(500);
	res.objects.sort((a, b) => b.score.final - a.score.final);
	const fetchedPackages = res.objects.map((pkg) => npmToDB(pkg.package));
	return fetchedPackages;
});

export const getNPMPackage = query(
	v.object({
		scope: v.optional(v.string()),
		package: v.string(),
	}),
	async (nameObject) => {
		const name = toPackageName(nameObject);
		const { db } = getRequestEvent().locals;
		const [possiblePkg] = await db
			.select({
				...getTableColumns($db.packages),
				keywords: sql<string>`json_group_array(packages_keywords.keyword)`.as('keywords'),
			})
			.from($db.packages)
			.leftJoin($db.packagesKeywords, eq($db.packages.name, $db.packagesKeywords.name))
			.where(eq($db.packages.name, name))
			.groupBy($db.packages.name);
		if (possiblePkg) {
			return parseColumn<{ keywords: string[] }, typeof possiblePkg>(possiblePkg, 'keywords');
		}
		const fetchFn = getRequestEvent().fetch;
		const npmPackage = await $fetch<NPMSearchPackage>(
			`https://registry.npmjs.org/${name}`,
			null,
			fetchFn
		);
		if (npmPackage === null) throw error(404);
		const pkg = npmToDB(npmPackage);
		await db.insert($db.packages).values([{ ...pkg, expires: new Date() }]);
		await db
			.insert($db.packagesKeywords)
			.values((npmPackage.keywords || []).map((v) => ({ name: npmPackage.name, keyword: v })));
		return pkg;
	}
);
