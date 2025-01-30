import type { RequestHandler } from './$types';
import type { Package, Readme } from '$db/schema';
import { fetchOr, getPackage, stripGit } from '$lib';
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
	const repo = stripGit(pkg.repository);
	if (!repo.includes('github')) {
		readme.value = 'Non GitHub repositories are not supported at this time!';
		return ok();
	}

	const readmeData = await fetchOr<{ content: string }>(
		`https://api.github.com/repos/${repo.substring(repo.indexOf('github.com') + 11)}/readme`,
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
      DELETE FROM readmes
        WHERE expires < NOW();
    `;
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
