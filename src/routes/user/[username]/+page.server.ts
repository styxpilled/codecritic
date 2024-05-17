import type { Actions } from './$types';
import { fetchOr } from '$lib';
import { badRequest } from '$lib/server';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
	follow: async ({ params, fetch, request }) => {
		const data = await request.formData();
		const id = data.get('id');
		if (!id) throw badRequest();
		await fetchOr(`/api/users/id/${id}/followers`, undefined, fetch, {
			method: 'POST'
		});
		throw redirect(302, `/user/${params.username}`);
	},
	unfollow: async ({ params, fetch, request }) => {
		const data = await request.formData();
		const id = data.get('id');
		if (!id) throw badRequest();
		await fetchOr(`/api/users/id/${id}/followers`, undefined, fetch, {
			method: 'DELETE'
		});
		throw redirect(302, `/user/${params.username}`);
	}
};
