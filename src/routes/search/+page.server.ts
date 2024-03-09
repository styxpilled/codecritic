import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	search: async ({ request }) => {
		const form = await request.formData();
		const formQuery = form.get('text');
		if (formQuery && typeof formQuery === 'string') {
			throw redirect(303, `/search?text=${formQuery}`);
		}
		throw redirect(303, `/search`);
	}
};
