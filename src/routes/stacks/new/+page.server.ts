import { fetchOr } from '$lib';
import { badRequest } from '$lib/server';
import type { Actions } from './$types';

export const actions: Actions = {
	create: async ({ request, fetch }) => {
		const body = await request.formData();
		const name = body.get('name');
		if (!name) throw badRequest();

		await fetchOr(`/api/stacks`, undefined, fetch, {
			method: 'POST',
			body: JSON.stringify({
				name,
				description: body.get('description') || ''
			})
		});
	}
};
