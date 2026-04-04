import * as v from 'valibot';
import { error, redirect } from '@sveltejs/kit';
import { query, form } from '$app/server';
import { $fetch } from '$lib';
import type { NPMSearchPackage } from '$lib/types';
import { npmToDB } from '$lib/server/helpers';

export const searchNPM = query(v.string(), async (query) => {
	const res = await $fetch<
		{ objects: { package: NPMSearchPackage; score: { final: number } }[] } | undefined
	>(`https://registry.npmjs.org/-/v1/search?text=${query}&size=50`, undefined, fetch);
	if (res === undefined) error(500);
	res.objects.sort((a, b) => b.score.final - a.score.final);
	const fetchedPackages = res.objects.map((pkg) => npmToDB(pkg.package));
	return fetchedPackages;
});
