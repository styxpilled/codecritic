import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import { query, getRequestEvent } from '$app/server';
import { $fetch, toPackageName } from '$lib';
import type { NPMSearchPackage } from '$lib/types';
import { npmToDB } from '$lib/server/helpers';

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
		package: v.string()
	}),
	async (nameObject) => {
		const name = toPackageName(nameObject);
		const fetchFn = getRequestEvent().fetch;
		const npmPackage = await $fetch<NPMSearchPackage>(
			`https://registry.npmjs.org/${name}`,
			null,
			fetchFn
		);
		if (npmPackage === null) throw error(404);
		const pkg = npmToDB(npmPackage);
		return pkg;
	}
);
