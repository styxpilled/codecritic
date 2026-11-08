import { error } from '@sveltejs/kit';
import { and, desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import * as v from 'valibot';
import { getDays } from '#lib/server/auth.ts';
import { $db, toStringArr } from '#lib/server/db/index.ts';
import { query, getRequestEvent, form } from '$app/server';
import {
	favoritesSchema,
	updateFollowSchema,
	updateProfileSchema,
} from './schemas';

/** The favorite packages of the selected user, in the order they chose. */
const favoritesArr = sql`(
	SELECT json_group_array(package)
	FROM (
		SELECT package FROM users_packages
		WHERE user_id = users.id
		ORDER BY position
	)
)`.mapWith(toStringArr);

/**
 * Scalar subqueries, so the counts never multiply the rows of a join. The outer
 * column is written as text, because Drizzle drops the table name from a column
 * in a query without joins, and the inner table would win.
 */
const userCounts = {
	reviews:
		sql`(SELECT COUNT(*) FROM reviews WHERE authorID = users.id)`.mapWith(
			Number
		),
	stacks: sql`(SELECT COUNT(*) FROM stacks WHERE author = users.id)`.mapWith(
		Number
	),
	/** Likes the user gave, over reviews and stacks. */
	likesGiven: sql`(
		(SELECT COUNT(*) FROM likes_reviews WHERE user_id = users.id)
		+ (SELECT COUNT(*) FROM stacks_likes WHERE user_id = users.id)
	)`.mapWith(Number),
	favorites: favoritesArr,
};

/** Likes the reviews of the user received. */
const likesReceived = sql`(
	SELECT COUNT(*) FROM likes_reviews
	INNER JOIN reviews ON reviews.id = likes_reviews.review_id
	WHERE reviews.authorID = users.id
)`.mapWith(Number);

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
			stacks: userCounts.stacks,
			favorites: favoritesArr,
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
	const [profile] = req;
	if (!profile) error(404);
	return profile;
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

export const setFavoritePackages = form(
	favoritesSchema,
	async ({ packages }) => {
		const { db, user } = getRequestEvent().locals;
		if (!user) error(401);
		const list = [
			...new Set(packages.map((p) => p.trim()).filter(Boolean)),
		].slice(0, 4);
		await db
			.delete($db.usersPackages)
			.where(eq($db.usersPackages.userID, user.id));
		if (list.length) {
			await db.insert($db.usersPackages).values(
				list.map((pkg, position) => ({
					userID: user.id,
					package: pkg,
					position,
				}))
			);
		}
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
				...userCounts,
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
				...userCounts,
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
				...userCounts,
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
		const since = recent
			? sql` AND created_at > ${Math.floor((Date.now() - getDays(7)) / 1000)}`
			: sql``;
		// Only members with a review, or with a review this week.
		const hasReviews = sql`EXISTS (SELECT 1 FROM reviews WHERE authorID = users.id${since})`;
		const users = await db
			.select({
				...getTableColumns($db.users),
				...userCounts,
				likes: likesReceived,
				...followFlags(user?.id ?? -1),
			})
			.from($db.users)
			.where(hasReviews)
			.orderBy(desc(likesReceived), desc(userCounts.reviews))
			.limit(limit)
			.offset(page * limit);
		return users;
	}
);
