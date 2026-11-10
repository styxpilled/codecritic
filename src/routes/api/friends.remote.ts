import { error } from '@sveltejs/kit';
import { eq, getTableColumns, desc } from 'drizzle-orm';
import { $db, reviewLikedFlag } from '#lib/server/db/index.ts';
import { query, getRequestEvent } from '$app/server';
import { genericSchema } from './schemas';

export const getFriendLikedReviews = query(
	genericSchema,
	async ({ page, limit = 18 }) => {
		const { db, user } = getRequestEvent().locals;
		if (!user) error(401);

		const reviews = await db
			.select({
				...getTableColumns($db.reviews),
				author: getTableColumns($db.users),
				liked: reviewLikedFlag(user.id),
			})
			.from($db.reviews)
			.leftJoin($db.likesReviews, eq($db.reviews.id, $db.likesReviews.reviewID))
			.innerJoin(
				$db.usersFollows,
				eq($db.likesReviews.userID, $db.usersFollows.following)
			)
			.innerJoin($db.users, eq($db.reviews.authorID, $db.users.id))
			.where(eq($db.usersFollows.userID, user.id))
			.groupBy($db.reviews.id)
			.orderBy(desc($db.reviews.createdAt))
			.limit(limit)
			.offset(page * limit);
		return reviews;
	}
);

export const getFriendRecentReviews = query(
	genericSchema,
	async ({ page, limit = 18 }) => {
		const { db, user } = getRequestEvent().locals;
		if (!user) error(401);

		const reviews = await db
			.select({
				...getTableColumns($db.reviews),
				author: getTableColumns($db.users),
				liked: reviewLikedFlag(user.id),
			})
			.from($db.reviews)
			.innerJoin(
				$db.usersFollows,
				eq($db.usersFollows.following, $db.reviews.authorID)
			)
			.innerJoin($db.users, eq($db.users.id, $db.reviews.authorID))
			.where(eq($db.usersFollows.userID, user.id))
			.orderBy(desc($db.reviews.createdAt))
			.limit(limit)
			.offset(page * limit);
		return reviews;
	}
);
