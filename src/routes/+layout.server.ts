export const load = async ({ locals }) => {
	// if (locals.error !== undefined) {
	// 	throw redirect(302, `/error?message=${locals.error.message}&code=${locals.error.code}`);
	// }

	return { auth: { session: locals.session, user: locals.user } };
};
