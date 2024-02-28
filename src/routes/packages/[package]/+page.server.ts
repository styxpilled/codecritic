import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, fetch, params }) => {
		const data = await request.formData();
		await fetch(`/api/package/${params.package}/review`, {
			method: 'POST',
			body: JSON.stringify({
				review: data.get('review'),
				version: data.get('version')
			})
		});
	}
};
