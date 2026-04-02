import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return { auth: { session: locals.session, user: locals.user } };
};
