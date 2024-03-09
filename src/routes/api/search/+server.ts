import { fetchOr } from '$lib';
import { ok, serverError } from '$lib/server';
import { addPackage, getRepoURL, sql } from '$lib/server/database';
import type { NPMPackage, Package } from '$lib/types';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const res = await fetchOr<{ objects: { package: NPMPackage }[] } | undefined>(
		`https://registry.npmjs.org/-/v1/search${url.search}`,
		undefined,
		fetch
	);
	if (res === undefined) throw serverError();

	const packages: string[] = res.objects.map((pkg) => pkg.package.name);
	const newPackages = (await sql`
    SELECT input.* FROM UNNEST(${packages}::text[]) as input
      LEFT JOIN packages
        ON packages.name = input
    WHERE packages.name IS NULL
  `) as { input: string }[];

	for (const packageName of newPackages) {
		await fetch(`/api/packages/${packageName.input}`, { method: 'POST' });
	}

	return ok(packages);
};
