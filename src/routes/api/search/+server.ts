import { fetchOr } from '$lib';
import { badRequest, ok, serverError } from '$lib/server';
import { addPackages, npmToDB } from '$lib/server/database';
import type { NPMSearchPackage } from '$lib/types';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url, fetch }) => {
	const res = await fetchOr<
		{ objects: { package: NPMSearchPackage; score: { final: number } }[] } | undefined
	>(`https://registry.npmjs.org/-/v1/search${url.search}`, undefined, fetch);
	if (res === undefined) throw serverError();
	res.objects.sort((a, b) => b.score.final - a.score.final);
	const fetchedPackages = res.objects.map((pkg) => npmToDB(pkg.package));
	// const newPackages = (await sql`
	//   SELECT input.* FROM UNNEST(${fetchedPackages}::text[]) as input
	//     LEFT JOIN packages
	//       ON packages.name = input
	//   WHERE packages.name IS NULL
	// `) as { input: string }[];

	// res.objects
	await addPackages(locals.sql, fetchedPackages);
	// for (const packageName of newPackages) {
	// 	await fetch(`/api/package/${packageName.input}`, { method: 'POST' });
	// }

	// const packages = await sql`
	//   SELECT * FROM packages
	//     WHERE name = ANY(${fetchedPackages}::text[])
	// `;

	return ok(fetchedPackages);
};
