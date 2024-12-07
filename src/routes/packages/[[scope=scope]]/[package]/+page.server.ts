import type { Actions, PageServerLoad } from './$types';
import type { Package, Review } from '$lib/types';
import { fetchOr, getPackage } from '$lib';
import type { Readme } from '$db/schema';

export const actions: Actions = {
	default: async ({ request, fetch, params }) => {
		const packageName = params.scope ? `${params.scope}/${params.package}` : params.package;
		const data = await request.formData();
		await fetch(`/api/package/${packageName}/reviews`, {
			method: 'POST',
			body: JSON.stringify({
				review: data.get('review'),
				rating: data.get('rating'),
				version: data.get('version')
			})
		});
	}
};

export const load: PageServerLoad = async ({ fetch, params }) => {
	const packageName = getPackage(params);

	// const pkg = await fetchOr<Package>(`/api/package/${packageName}`, undefined, fetch);
	// const readme = await fetchOr<Readme>(`/api/package/${packageName}/readme`, undefined, fetch);

	const [pkg, readme, reviews] = await Promise.all([
		fetchOr<Package>(`/api/package/${packageName}`, undefined, fetch),
		fetchOr<Readme>(`/api/package/${packageName}/readme`, undefined, fetch),
		fetchOr<Review[]>(`/api/package/${packageName}/reviews`, [], fetch)
	]);

	// TODO: age & cache-control headers

	// const reviews = await fetchOr<Review[]>(`/api/package/${packageName}/reviews`, [], fetch);
	return { packageName, package: pkg, readme, reviews: reviews };
};
