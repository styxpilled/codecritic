import type { RequestHandler } from './$types';
import type { Package, Readme } from '$db/schema';
import { fetchOr, getPackage } from '$lib';
import { notFound, ok } from '$lib/server';

export const GET: RequestHandler = async ({ locals, params, cookies, fetch }) => {
	const packageName = getPackage(params);

	let [readme]: [Readme?] = await locals.sql`
    SELECT * FROM readmes
      WHERE name = ${packageName}
  `;

	if (readme) {
		return ok(readme, 'short');
	} else {
		readme = {
			name: packageName,
			value: '',
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
		};
	}

	const pkg = await fetchOr<Package>(`/api/package/${packageName}`, undefined, fetch);
	if (!pkg) throw notFound();
	if (pkg.repository === null) return ok(readme);

	const ghAuth = cookies.get('github_access_token');
	const auth = ghAuth ? { Authorization: `Bearer ${ghAuth}` } : {};
	const repo = pkg.repository.endsWith('.git')
		? pkg.repository.substring(0, pkg.repository.length - 4)
		: pkg.repository;

	const readmeData = await fetchOr<{ content: string }>(
		`https://api.github.com/repos/${repo.substring(
			repo.indexOf('github.com') + 11
		)}/contents/README.md`,
		undefined,
		fetch,
		{
			// @ts-expect-error ts is mad again
			headers: {
				...auth,
				'User-Agent': 'codecritic'
			}
		}
	);
	if (readmeData !== undefined && readmeData.content) {
		const buff = Buffer.from(readmeData.content, 'base64');
		readme.value = buff.toString();
		await locals.sql`
      INSERT INTO readmes
        ${locals.sql(readme)}
      ON CONFLICT(name)
      DO UPDATE SET
        value = ${readme.value} 
    `;
	}
	return ok(readme, 'short');
};
