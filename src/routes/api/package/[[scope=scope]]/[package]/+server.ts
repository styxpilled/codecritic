import type { RequestHandler } from './$types';
import { fetchOr, getPackage } from '$lib';
import { notFound, ok } from '$lib/server';
import { addPackages, npmToDB } from '$lib/server/database';
import type { NPMSearchPackage } from '$lib/types';

export const GET: RequestHandler = async ({ fetch, params, locals }) => {
	const packageName = getPackage(params);
	const [pkg] = await locals.sql`
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

	return ok(pkg, 'short');
};

export const POST: RequestHandler = async ({ fetch, params, locals }) => {
	const packageName = getPackage(params);

	const npmPackage = await fetchOr<NPMSearchPackage>(
		`https://registry.npmjs.org/${packageName}`,
		undefined,
		fetch
	);
	if (npmPackage === undefined) throw notFound();

	await locals.sql`
    DELETE FROM packages
      WHERE name = ${npmPackage.name}
  `;

	const pkg = npmToDB(npmPackage);
	await addPackages(locals.sql, [pkg]);
	// const [pkg] = await addPackage(locals.sql, npmPackage, getRepoURL(npmPackage?.repository?.url));

	return ok(pkg);
};
