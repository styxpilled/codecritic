import { fetchOr } from '$lib';
import type { Review } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const pkg: any = await fetchOr(`https://registry.npmjs.org/${params.package}`, undefined, fetch);
	let readme = null;

	if (pkg.repository) {
		const repo: string = pkg.repository.url;
		const readmeData = await fetchOr<{ content: string }>(
			`https://api.github.com/repos/${repo.substring(
				repo.indexOf('github.com') + 11,
				repo.length - 4
			)}/contents/README.md`,
			undefined,
			fetch
		);
		if (readmeData !== undefined && readmeData.content) {
			readme = atob(readmeData.content);
		}
	}

	// const repo = pkg.repository;
	const reviews = fetchOr<Review[]>(`/api/packages/${params.package}/review`, [], fetch);
	return { package: pkg, readme, reviews: await reviews };
};
