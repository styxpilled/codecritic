import { error } from '@sveltejs/kit';
import { and, eq, getTableColumns, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import * as v from 'valibot';
import { query, getRequestEvent, form } from '$app/server';
import { $db } from '$lib/server/db';
import { updateFollowSchema, updateProfileSchema } from './schemas';

export const getUser = query(v.string(), async (username) => {
	const { db } = getRequestEvent().locals;
	const [user] = await db.select().from($db.users).where(eq($db.users.username, username)).limit(1);
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
			followsUser: sql`${user?.id || -1} = ${following.following}`.mapWith(Boolean),
			userFollows: sql`${user?.id || -1} = ${followers.userID}`.mapWith(Boolean),
		})
		.from($db.users)
		.leftJoin($db.profiles, eq($db.users.id, $db.profiles.id))
		.leftJoin(following, eq($db.users.id, following.userID))
		.leftJoin(followers, eq($db.users.id, followers.following))
		.where(eq($db.users.username, username))
		.groupBy($db.users.id);
	// console.log(req);
	if (!req) error(404);
	return req[0];
});

export const updateProfile = form(updateProfileSchema, async ({ nickname, bio, url }) => {
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
});

export const getFollowing = query(
	v.object({
		username: v.string(),
		count: v.optional(v.pipe(v.number(), v.maxValue(50))),
	}),
	async ({ username, count = 20 }) => {
		const { db } = getRequestEvent().locals;
		const user = await getUser(username);
		const res = await db
			.select({ ...getTableColumns($db.users) })
			.from($db.users)
			.innerJoin($db.usersFollows, eq($db.users.id, $db.usersFollows.following))
			.where(eq($db.usersFollows.userID, user.id))
			.limit(count);
		console.log(res);
		return res;
	}
);

export const getFollowers = query(
	v.object({
		username: v.string(),
		count: v.optional(v.pipe(v.number(), v.maxValue(50))),
	}),
	async ({ username, count = 20 }) => {
		const { db } = getRequestEvent().locals;
		const user = await getUser(username);
		const res = await db
			.select({ ...getTableColumns($db.users) })
			.from($db.users)
			.innerJoin($db.usersFollows, eq($db.users.id, $db.usersFollows.userID))
			.where(eq($db.usersFollows.following, user.id))
			.limit(count);
		console.log(res);
		return res;
	}
);

export const follow = form(updateFollowSchema, async ({ username }) => {
	const { db, user } = getRequestEvent().locals;
	if (!user) error(401);
	if (user.username === username) error(400);
	const [req] = await db.select().from($db.users).where(eq($db.users.username, username));
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
	const [req] = await db.select().from($db.users).where(eq($db.users.username, username));
	if (!req) error(404);
	await db
		.delete($db.usersFollows)
		.where(and(eq($db.usersFollows.userID, user.id), eq($db.usersFollows.following, req.id)));
	return;
});
