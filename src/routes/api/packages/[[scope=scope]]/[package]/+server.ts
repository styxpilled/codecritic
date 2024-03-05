import type { RequestHandler } from './$types';
import { fetchOr, getPackage } from '$lib';
import { notFound, ok } from '$lib/server';
import { sql } from '$lib/server/database';
import type { NPMPackage } from '$lib/types';

export const GET: RequestHandler = async ({ fetch, params }) => {
	const packageName = getPackage(params);
	const [pkg] = await sql`
    SELECT * FROM packages
      WHERE name = ${packageName}
  `;

	if (!pkg) {
		const newPackage = await fetchOr(`/api/packages/${packageName}`, undefined, fetch, {
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

	const repoURL = npmPackage?.repository?.url;
	const repository = repoURL
		? 'https://github.com' +
			repoURL.substring(repoURL.indexOf('github.com') + 10, repoURL.length - 4)
		: undefined;

	const [pkg] = await sql`
    INSERT INTO packages
      (name, description, keywords, latest, next, license, repository, homepage, author, public)
    VALUES
      (
      ${npmPackage.name},
      ${npmPackage.description},
      ${npmPackage?.keywords},
      ${npmPackage['dist-tags'].latest},
      ${npmPackage['dist-tags']?.next},
      ${npmPackage?.license},
      ${repository},
      ${npmPackage?.homepage},
      ${npmPackage?.author?.name},
      ${npmPackage?.public}
      )
    RETURNING *
  `;

	return ok(pkg);
};
