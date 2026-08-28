import { error } from '@sveltejs/kit';
import { and, lt, sql, eq, gt } from 'drizzle-orm';
import { deleteReview } from '$api/reviews.remote.js';
import { $db } from '$lib/server/db/index.js';
import type {} from './$types';

export const GET = async ({ locals }) => {
	const { db, user } = locals;
	// await db.delete($db.reviews);
	// return new Response();
	const id = 1;
	if (!user) error(401);
	const [review] = await db
		.delete($db.reviews)
		.where(and(eq($db.reviews.authorID, user.id), eq($db.reviews.id, id)))
		.returning();
	if (!review) error(404);
	const test = await db
		.update($db.reviews)
		.set({
			index: sql`${$db.reviews.index} - 1`,
		})
		.where(gt($db.reviews.index, review.index))
		.returning();
	// await db.delete($db.reviews).where(eq($db.reviews.index, 0));
	return new Response();
};
