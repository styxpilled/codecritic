import type { RequestHandler } from './$types';
import { fetchOr, getPackage } from '$lib';
import { notFound, ok } from '$lib/server';
import { addPackage, getRepoURL, sql } from '$lib/server/database';
import type { NPMPackage } from '$lib/types';

export const GET: RequestHandler = async ({ fetch, params }) => {
	const packageName = getPackage(params);
	const [pkg] = await sql`
    SELECT * FROM packages
      WHERE name = ${packageName}
  `;

	if (!pkg) {
		const newPackage = await fetchOr(`/api/package/${packageName}`, undefined, fetch, {
			method: 'POST'
		});
		if (newPackage === undefined) throw notFound();
		else return ok(newPackage);
	}

	return ok(pkg);
};

export const POST: RequestHandler = async ({ fetch, params }) => {
	const packageName = getPackage(params);

	const npmPackage = await fetchOr<NPMPackage>(
		`https://registry.npmjs.org/${packageName}`,
		undefined,
		fetch
	);
	if (npmPackage === undefined) throw notFound();

	await sql`
    DELETE FROM packages
      WHERE name = ${npmPackage.name}
  `;

	const [pkg] = await addPackage(npmPackage, getRepoURL(npmPackage?.repository?.url));

	return ok(pkg);
};
