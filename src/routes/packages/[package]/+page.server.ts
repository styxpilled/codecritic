import { fetchOr } from '$lib';
import type { Review } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

export const actions: Actions = {
	default: async ({ request, fetch, params }) => {
		const data = await request.formData();
		await fetch(`/api/packages/${params.package}/review`, {
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const pkg: any = await fetchOr(`https://registry.npmjs.org/${params.package}`, undefined, fetch);
	let readme = null;

	if (pkg.repository) {
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

	// const repo = pkg.repository;
	const reviews = fetchOr<Review[]>(`/api/packages/${params.package}/review`, [], fetch);
	return { package: pkg, readme, reviews: await reviews };
};
