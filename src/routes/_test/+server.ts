import { db } from '$lib/server/database';

export const GET = async () => {
	const g = await db.from('auth.users').select('*');

	console.log(g);

	return new Response();
};
