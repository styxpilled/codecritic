import type { Actions } from './$types';

export const actions: Actions = {
	like: async ({ fetch, params }) => {
		await fetch(`/api/reviews/${params.id}/like`, { method: 'POST' });
		return {};
	},
	unlike: async ({ fetch, params }) => {
		await fetch(`/api/reviews/${params.id}/like`, { method: 'DELETE' });
		return {};
	}
};
