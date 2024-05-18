import { unauthorized } from '$lib/server';
import type { Actions } from './$types';

export const actions: Actions = {
	updateProfile: async ({ fetch, request, locals }) => {
		if (!locals.user) throw unauthorized();
		const data = await request.formData();
		await fetch(`/api/users/${locals.user.id}/profile`, {
			method: 'PUT',
			body: JSON.stringify({
				bio: data.get('bio') || '',
				url: data.get('url') || '',
				links: data.get('links') || []
			})
		});
	}
};
