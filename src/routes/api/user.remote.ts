import { error } from '@sveltejs/kit';
import { and, eq, getTableColumns, gt, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import * as v from 'valibot';
import { query, getRequestEvent, form } from '$app/server';
import { getDays } from '$lib/server/auth';
import { $db } from '$lib/server/db';
import { updateFollowSchema, updateProfileSchema } from './schemas';

export const getUser = query(v.string(), async (username) => {
	const { db } = getRequestEvent().locals;
	const [user] = await db
		.select()
		.from($db.users)
		.where(eq($db.users.username, username))
		.limit(1);
	if (!user) error(404);
	return user;
});

export const getProfile = query(v.string(), async (username) => {
	const { db, user } = getRequestEvent().locals;
	const following = alias($db.usersFollows, 'following');
	const followers = alias($db.usersFollows, 'followers');
	const req = await db
		.select({
			...getTableColumns($db.users),
			profile: $db.profiles,
			following: sql`COUNT(DISTINCT following.following)`.mapWith(Number),
			followers: sql`COUNT(DISTINCT followers.user_id)`.mapWith(Number),
			reviews: sql`COUNT(DISTINCT ${$db.reviews.id})`.mapWith(Number),
			followsUser: sql`${user?.id || -1} = ${following.following}`.mapWith(
				Boolean
			),
			userFollows: sql`${user?.id || -1} = ${followers.userID}`.mapWith(
				Boolean
			),
		})
		.from($db.users)
		.leftJoin($db.profiles, eq($db.users.id, $db.profiles.id))
		.leftJoin(following, eq($db.users.id, following.userID))
		.leftJoin(followers, eq($db.users.id, followers.following))
		.leftJoin($db.reviews, eq($db.users.id, $db.reviews.authorID))
		.where(eq($db.users.username, username))
		.groupBy($db.users.id);
	if (!req) error(404);
	return req[0];
});

export const updateProfile = form(
	updateProfileSchema,
	async ({ nickname, bio, url }) => {
		const { db, user } = getRequestEvent().locals;
		if (!user) error(401);
		const [res] = await db
			.update($db.profiles)
			.set({
				bio: bio || '',
				url: url || '',
			})
			.where(eq($db.profiles.id, user.id))
			.returning();
		const [profile] = await db
			.update($db.users)
			.set({
				nickname,
			})
			.where(eq($db.users.id, user.id))
			.returning();
		return { ...res, profile };
	}
);

/** Follow state of the selected user, relative to the signed in user. */
const followFlags = (viewerID: number) => ({
	followsUser:
		sql`EXISTS (SELECT 1 FROM users_follows WHERE user_id = ${$db.users.id} AND following = ${viewerID})`.mapWith(
			Boolean
		),
	userFollows:
		sql`EXISTS (SELECT 1 FROM users_follows WHERE user_id = ${viewerID} AND following = ${$db.users.id})`.mapWith(
			Boolean
		),
});

export const getFollowing = query(
	v.object({
		username: v.string(),
		count: v.optional(v.pipe(v.number(), v.maxValue(50))),
	}),
	async ({ username, count = 20 }) => {
		const { db, user: viewer } = getRequestEvent().locals;
		const user = await getUser(username);
		const res = await db
			.select({
				...getTableColumns($db.users),
				...followFlags(viewer?.id ?? -1),
			})
			.from($db.users)
			.innerJoin($db.usersFollows, eq($db.users.id, $db.usersFollows.following))
			.where(eq($db.usersFollows.userID, user.id))
			.limit(count);
		return res;
	}
);

export const getFollowers = query(
	v.object({
		username: v.string(),
		count: v.optional(v.pipe(v.number(), v.maxValue(50))),
	}),
	async ({ username, count = 20 }) => {
		const { db, user: viewer } = getRequestEvent().locals;
		const user = await getUser(username);
		const res = await db
			.select({
				...getTableColumns($db.users),
				...followFlags(viewer?.id ?? -1),
			})
			.from($db.users)
			.innerJoin($db.usersFollows, eq($db.users.id, $db.usersFollows.userID))
			.where(eq($db.usersFollows.following, user.id))
			.limit(count);
		return res;
	}
);

export const getMutuals = query(
	v.object({
		username: v.string(),
		count: v.optional(v.pipe(v.number(), v.maxValue(50))),
	}),
	async ({ username, count = 20 }) => {
		const { db, user: viewer } = getRequestEvent().locals;
		const user = await getUser(username);
		const follows = alias($db.usersFollows, 'follows');
		const followed = alias($db.usersFollows, 'followed');
		const res = await db
			.select({
				...getTableColumns($db.users),
				...followFlags(viewer?.id ?? -1),
			})
			.from($db.users)
			.innerJoin(
				follows,
				and(eq(follows.userID, user.id), eq(follows.following, $db.users.id))
			)
			.innerJoin(
				followed,
				and(eq(followed.userID, $db.users.id), eq(followed.following, user.id))
			)
			.limit(count);
		return res;
	}
);

export const follow = form(updateFollowSchema, async ({ username }) => {
	const { db, user } = getRequestEvent().locals;
	if (!user) error(401);
	if (user.username === username) error(400);
	const [req] = await db
		.select()
		.from($db.users)
		.where(eq($db.users.username, username));
	if (!req) error(404);
	await db
		.insert($db.usersFollows)
		.values({
			userID: user.id,
			following: req.id,
		})
		.onConflictDoNothing();
	return;
});

export const unfollow = form(updateFollowSchema, async ({ username }) => {
	const { db, user } = getRequestEvent().locals;
	if (!user) error(401);
	const [req] = await db
		.select()
		.from($db.users)
		.where(eq($db.users.username, username));
	if (!req) error(404);
	await db
		.delete($db.usersFollows)
		.where(
			and(
				eq($db.usersFollows.userID, user.id),
				eq($db.usersFollows.following, req.id)
			)
		);
	return;
});

export const getPopularUsers = query(
	v.object({
		limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(18))),
		page: v.optional(v.number(), 0),
		recent: v.optional(v.boolean()),
	}),
	async ({ limit = 6, page, recent }) => {
		const { db, user } = getRequestEvent().locals;
		const cond = recent
			? gt($db.reviews.createdAt, new Date(new Date().getTime() - getDays(7)))
			: undefined;
		const following = alias($db.usersFollows, 'following');
		const followers = alias($db.usersFollows, 'followers');
		const users = await db
			.select({
				...getTableColumns($db.users),
				likes: sql`COUNT(DISTINCT ${$db.likesReviews.reviewID})`.mapWith(
					Number
				),
				reviews: sql`COUNT(DISTINCT ${$db.reviews.id})`.mapWith(Number),
				followsUser: sql`${user?.id || -1} = ${following.following}`.mapWith(
					Boolean
				),
				userFollows: sql`${user?.id || -1} = ${followers.userID}`.mapWith(
					Boolean
				),
			})
			.from($db.users)
			.innerJoin($db.reviews, eq($db.users.id, $db.reviews.authorID))
			.leftJoin($db.likesReviews, eq($db.reviews.id, $db.likesReviews.reviewID))
			.leftJoin(following, eq($db.users.id, following.userID))
			.leftJoin(followers, eq($db.users.id, followers.following))
			.where(cond)
			.groupBy($db.users.id)
			.orderBy(sql`COUNT(${$db.likesReviews.reviewID}) DESC`)
			.limit(limit)
			.offset(page * limit);
		return users;
	}
);
