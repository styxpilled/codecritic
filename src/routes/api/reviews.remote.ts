import { error } from '@sveltejs/kit';
import {
	and,
	eq,
	getTableColumns,
	sql,
	desc,
	asc,
	count,
	gt,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import * as v from 'valibot';
import { form, getRequestEvent, query } from '$app/server';
import { $db } from '$lib/server/db';
import {
	createReviewSchema,
	genericSchema,
	getReviewSchema,
	reviewSortSchema,
} from './schemas';

/** Whether the signed in user likes the selected review. */
const likedFlag = (viewerID: number) =>
	sql`EXISTS (SELECT 1 FROM likes_reviews WHERE review_id = ${$db.reviews.id} AND user_id = ${viewerID})`.mapWith(
		Boolean
	);

export const getUserReviews = query(
	v.object({
		username: v.string(),
		pkg: v.optional(v.string()),
		sort: v.optional(reviewSortSchema, 'recent'),
		limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(50))),
		page: v.optional(v.number(), 0),
	}),
	async ({ username, pkg, sort = 'recent', limit = 25, page }) => {
		const { db, user } = getRequestEvent().locals;
		const order = {
			recent: desc($db.reviews.createdAt),
			popular: sql`COUNT(likes_reviews.user_id) DESC`,
		}[sort];
		const g = await db
			.select({
				...getTableColumns($db.reviews),
				liked: likedFlag(user?.id ?? -1),
				likes: sql`COUNT(likes_reviews.user_id)`.mapWith(Number),
			})
			.from($db.reviews)
			.leftJoin($db.likesReviews, eq($db.reviews.id, $db.likesReviews.reviewID))
			.innerJoin($db.users, eq($db.users.id, $db.reviews.authorID))
			.where(
				and(
					eq($db.users.username, username),
					pkg ? eq($db.reviews.packageID, pkg) : undefined
				)
			)
			.orderBy(order)
			.groupBy($db.reviews.id)
			.limit(limit)
			.offset(page * limit);
		return g;
	}
);

export const getReview = query(getReviewSchema, async (obj) => {
	const { db, user } = getRequestEvent().locals;
	let cond;
	if (obj.type === 'id') {
		cond = eq($db.reviews.id, obj.id);
	} else {
		cond = and(
			eq($db.users.username, obj.author),
			eq($db.reviews.packageID, obj.package),
			eq($db.reviews.index, obj.index)
		);
	}
	const [review] = await db
		.select({
			...getTableColumns($db.reviews),
			liked: likedFlag(user?.id ?? -1),
			likes: sql`COUNT(${$db.likesReviews.reviewID})`.mapWith(Number),
		})
		.from($db.reviews)
		.leftJoin($db.likesReviews, eq($db.reviews.id, $db.likesReviews.reviewID))
		.leftJoin($db.users, eq($db.reviews.authorID, $db.users.id))
		.where(cond)
		.orderBy(asc($db.reviews.createdAt));
	return review;
});

export const getRecentReview = query(
	v.object({
		authorID: v.optional(v.number()),
		pkg: v.string(),
	}),
	async ({ authorID, pkg }) => {
		const { db, user } = getRequestEvent().locals;
		if (!authorID && !user) return null;
		let author;
		if (authorID) author = authorID;
		else if (user) author = user.id;
		else return null;
		// const author = authorID || user.id;
		const [review] = await db
			.select({
				...getTableColumns($db.reviews),
				liked: likedFlag(user?.id ?? -1),
			})
			.from($db.reviews)
			.where(
				and(eq($db.reviews.authorID, author), eq($db.reviews.packageID, pkg))
			)
			.orderBy(desc($db.reviews.index))
			.limit(1);
		return review || null;
	}
);

export const getPopularReviews = query(
	v.object({
		packageID: v.string(),
		page: v.optional(v.number()),
	}),
	async ({ packageID }) => {
		const { db, user } = getRequestEvent().locals;
		const reviews = await db
			.select({
				...getTableColumns($db.reviews),
				liked: likedFlag(user?.id ?? -1),
				likes: sql`COUNT(${$db.likesReviews.reviewID})`.mapWith(Number),
				author: $db.users,
			})
			.from($db.reviews)
			.leftJoin($db.likesReviews, eq($db.reviews.id, $db.likesReviews.reviewID))
			.innerJoin($db.users, eq($db.reviews.authorID, $db.users.id))
			.where(eq($db.reviews.packageID, packageID))
			.groupBy($db.reviews.id)
			.orderBy(sql`COUNT(${$db.likesReviews.reviewID}) DESC`);
		return reviews;
	}
);

export const getGlobalPopularReviews = query(
	genericSchema,
	async ({ page, limit }) => {
		const { db, user } = getRequestEvent().locals;
		const reviews = await db
			.select({
				...getTableColumns($db.reviews),
				liked: likedFlag(user?.id ?? -1),
				likes: sql`COUNT(${$db.likesReviews.reviewID})`.mapWith(Number),
				author: $db.users,
			})
			.from($db.reviews)
			.leftJoin($db.likesReviews, eq($db.reviews.id, $db.likesReviews.reviewID))
			.innerJoin($db.users, eq($db.reviews.authorID, $db.users.id))
			.groupBy($db.reviews.id)
			.orderBy(sql`COUNT(${$db.likesReviews.reviewID}) DESC`);
		return reviews;
	}
);

export const getLikedReviews = query(v.string(), async (username) => {
	const { db, user } = getRequestEvent().locals;
	const author = alias($db.users, 'author');
	const reviews = await db
		.select({
			...getTableColumns($db.reviews),
			liked: likedFlag(user?.id ?? -1),
			likes: sql`COUNT(${$db.likesReviews.reviewID})`.mapWith(Number),
			author: author,
		})
		.from($db.reviews)
		.leftJoin($db.likesReviews, eq($db.reviews.id, $db.likesReviews.reviewID))
		.innerJoin(author, eq(author.id, $db.reviews.authorID))
		.innerJoin($db.users, eq($db.likesReviews.userID, $db.users.id))
		.where(eq($db.users.username, username))
		.groupBy($db.reviews.id)
		.orderBy(sql`${$db.reviews.createdAt} DESC`);
	return reviews;
});

export const getReviewLikes = query(getReviewSchema, async (obj) => {
	const { db } = getRequestEvent().locals;
	let cond;
	const author = alias($db.users, 'author');
	if (obj.type === 'id') {
		cond = eq($db.reviews.id, obj.id);
	} else {
		cond = and(
			eq(author.username, obj.author),
			eq($db.reviews.packageID, obj.package),
			eq($db.reviews.index, obj.index)
		);
	}
	const users = await db
		.select({ ...getTableColumns($db.users) })
		.from($db.likesReviews)
		.innerJoin($db.reviews, eq($db.likesReviews.reviewID, $db.reviews.id))
		.innerJoin(author, eq($db.reviews.authorID, author.id))
		.innerJoin($db.users, eq($db.likesReviews.userID, $db.users.id))
		.where(cond);
	return users;
});

export const likeReview = form(
	v.object({
		id: v.number(),
	}),
	async ({ id }) => {
		const { db, user } = getRequestEvent().locals;
		if (!user) error(401);
		await db
			.insert($db.likesReviews)
			.values({
				userID: user.id,
				reviewID: id,
			})
			.onConflictDoNothing();
	}
);

export const unlikeReview = form(
	v.object({
		id: v.number(),
	}),
	async ({ id }) => {
		const { db, user } = getRequestEvent().locals;
		if (!user) error(401);
		await db
			.delete($db.likesReviews)
			.where(
				and(
					eq($db.likesReviews.userID, user.id),
					eq($db.likesReviews.reviewID, id)
				)
			);
	}
);

export const createReview = form(
	createReviewSchema,
	async ({ pkg, rating, content, version, id }) => {
		const { db, user } = getRequestEvent().locals;
		if (!user) error(401);
		if (id) {
			return await db
				.update($db.reviews)
				.set({
					rating,
					content,
					version,
				})
				.where(and(eq($db.reviews.id, id), eq($db.reviews.authorID, user.id)))
				.returning();
		}
		const [info] = await db
			.select({
				index: count(),
			})
			.from($db.reviews)
			.where(
				and(eq($db.reviews.authorID, user.id), eq($db.reviews.packageID, pkg))
			);
		return await db
			.insert($db.reviews)
			.values({
				authorID: user.id,
				content: content,
				createdAt: new Date(),
				packageID: pkg,
				rating: rating,
				version: version,
				index: info.index,
			})
			.returning();
	}
);

export const deleteReview = form(
	v.object({
		id: v.number(),
	}),
	async ({ id }) => {
		const { db, user } = getRequestEvent().locals;
		if (!user) error(401);
		const [review] = await db
			.delete($db.reviews)
			.where(and(eq($db.reviews.authorID, user.id), eq($db.reviews.id, id)))
			.returning();
		if (!review) error(404);
		await db
			.update($db.reviews)
			.set({
				index: sql`${$db.reviews.index} - 1`,
			})
			.where(gt($db.reviews.index, review.index));
	}
);
