import { error } from '@sveltejs/kit';
import { eq, getTableColumns, sql, desc } from 'drizzle-orm';
import { query, getRequestEvent } from '$app/server';
import { $db } from '$lib/server/db';
import { genericSchema } from './schemas';

export const getFriendLikedReviews = query(genericSchema, async ({ page, limit = 18 }) => {
	const { db, user } = getRequestEvent().locals;
	if (!user) error(401);

	const reviews = await db
		.select({
			...getTableColumns($db.reviews),
			author: getTableColumns($db.users),
			likes: sql`COUNT(${$db.likesReviews.userID})`.mapWith(Number),
			liked: sql`${user.id} = ${$db.likesReviews.userID}`.mapWith(Boolean),
		})
		.from($db.reviews)
		.leftJoin($db.likesReviews, eq($db.reviews.id, $db.likesReviews.reviewID))
		.innerJoin($db.usersFollows, eq($db.likesReviews.userID, $db.usersFollows.following))
		.innerJoin($db.users, eq($db.reviews.authorID, $db.users.id))
		.where(eq($db.usersFollows.userID, user.id))
		.groupBy($db.reviews.id)
		.orderBy(desc($db.reviews.createdAt))
		.limit(limit)
		.offset(page * limit);
	return reviews;
});

export const getFriendRecentReviews = query(genericSchema, async ({ page, limit = 18 }) => {
	const { db, user } = getRequestEvent().locals;
	if (!user) error(401);

	const reviews = await db
		.select({
			...getTableColumns($db.reviews),
			author: getTableColumns($db.users),
			likes: sql`COUNT(${$db.likesReviews.userID})`.mapWith(Number),
			liked: sql`${user.id} = ${$db.likesReviews.userID}`.mapWith(Boolean),
		})
		.from($db.reviews)
		.innerJoin($db.usersFollows, eq($db.usersFollows.following, $db.reviews.authorID))
		.innerJoin($db.users, eq($db.users.id, $db.reviews.authorID))
		.leftJoin($db.likesReviews, eq($db.reviews.id, $db.likesReviews.reviewID))
		.where(eq($db.usersFollows.userID, user.id))
		.groupBy($db.reviews.id)
		.orderBy(desc($db.reviews.createdAt))
		.limit(limit)
		.offset(page * limit);
	return reviews;
});
