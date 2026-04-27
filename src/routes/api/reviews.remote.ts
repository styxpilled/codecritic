import { error } from '@sveltejs/kit';
import { and, eq, getTableColumns, sql, desc, asc, count, gt } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import * as v from 'valibot';
import { form, getRequestEvent, query } from '$app/server';
import { $db } from '$lib/server/db';
import { createReviewSchema, getReviewSchema } from './schemas';
import { getUser } from './user.remote';

export const getUserReviews = query(
	v.object({
		username: v.string(),
	}),
	async ({ username }) => {
		const { db, user } = getRequestEvent().locals;
		const author = await getUser(username);
		const g = await db
			.select({
				...getTableColumns($db.reviews),
				liked: (user ? sql`${user.id} = ${$db.likesReviews.userID}` : sql`0`).mapWith(Boolean),
				likes: sql`COUNT(likes_reviews.user_id)`.mapWith(Number),
			})
			.from($db.reviews)
			.leftJoin($db.likesReviews, eq($db.reviews.id, $db.likesReviews.reviewID))
			.where(eq($db.reviews.authorID, author.id))
			.orderBy(desc($db.reviews.createdAt))
			.groupBy($db.reviews.id);
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
			liked: (user ? sql`${user.id} = ${$db.likesReviews.userID}` : sql`0`).mapWith(Boolean),
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
				liked: (user ? sql`${user.id} = ${$db.likesReviews.userID}` : sql`0`).mapWith(Boolean),
			})
			.from($db.reviews)
			.leftJoin($db.likesReviews, eq($db.reviews.id, $db.likesReviews.reviewID))
			.leftJoin($db.users, eq($db.reviews.authorID, $db.users.id))
			.where(and(eq($db.reviews.authorID, author), eq($db.reviews.packageID, pkg)))
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
				liked: (user ? sql`${user.id} = ${$db.likesReviews.userID}` : sql`0`).mapWith(Boolean),
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
			.where(and(eq($db.likesReviews.userID, user.id), eq($db.likesReviews.reviewID, id)));
	}
);

export const createReview = form(
	createReviewSchema,
	async ({ pkg, rating, content, version, id }) => {
		const { db, user } = getRequestEvent().locals;
		if (!user) error(401);
		console.log(id);
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
			.where(and(eq($db.reviews.authorID, user.id), eq($db.reviews.packageID, pkg)));
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
