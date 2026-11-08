import { error, redirect } from '@sveltejs/kit';
import { asc, eq, and, getTableColumns } from 'drizzle-orm';
import { optSubpath } from '#lib';
import { $db } from '#lib/server/db/index.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { db } = locals;
	const [review] = await db
		.select({
			...getTableColumns($db.reviews),
			username: $db.users.username,
		})
		.from($db.reviews)
		.innerJoin($db.users, eq($db.reviews.authorID, $db.users.id))
		.where(eq($db.reviews.id, parseInt(params.id)));
	if (!review) error(404);

	redirect(
		303,
		`/user/${review.username}/package/${review.packageID}/${optSubpath(review.index)}`
	);
};
