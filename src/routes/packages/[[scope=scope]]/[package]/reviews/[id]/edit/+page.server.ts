import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getPackage } from '$lib';

export const actions: Actions = {
	edit: async ({ request, fetch, params }) => {
		const form = await request.formData();
		await fetch(`/api/reviews/${params.id}`, {
			method: 'PUT',
			body: JSON.stringify({
				review: form.get('review'),
				rating: form.get('rating')
			})
		});
		const pkg = getPackage(params);
		throw redirect(302, `/packages/${pkg}/reviews/${params.id}`);
	},
	delete: async ({ params, fetch }) => {
		const pkg = getPackage(params);
		await fetch(`/api/reviews/${params.id}`, {
			method: 'DELETE'
		});
		throw redirect(302, `/packages/${pkg}`);
	}
};
