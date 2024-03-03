import type { Actions, PageServerLoad } from './$types';
import type { Review } from '$lib/types';
import { fetchOr } from '$lib';

export const actions: Actions = {
	default: async ({ request, fetch, params }) => {
		const packageName = params.scope ? `${params.scope}/${params.package}` : params.package;
		const data = await request.formData();
		await fetch(`/api/packages/${packageName}/reviews`, {
			method: 'POST',
			body: JSON.stringify({
				review: data.get('review'),
				rating: data.get('rating'),
				version: data.get('version')
			})
		});
	}
};

export const load: PageServerLoad = async ({ fetch, params, cookies }) => {
	const packageName = params.scope ? `${params.scope}/${params.package}` : params.package;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const pkg: any = await fetchOr(`https://registry.npmjs.org/${packageName}`, undefined, fetch);
	let readme = null;

	if (pkg?.repository) {
		const ghAuth = cookies.get('github_access_token');
		const auth = ghAuth ? { Authorization: `Bearer ${ghAuth}` } : {};
		const repo: string = pkg.repository.url;
		const readmeData = await fetchOr<{ content: string }>(
			`https://api.github.com/repos/${repo.substring(
				repo.indexOf('github.com') + 11,
				repo.length - 4
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
			readme = atob(readmeData.content);
		}
	}

	// TODO: age & cache-control headers

	const reviews = await fetchOr<Review[]>(`/api/packages/${packageName}/reviews`, [], fetch);
	return { packageName, package: pkg, readme, reviews: reviews };
};
