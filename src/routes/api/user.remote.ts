import { error } from '@sveltejs/kit';
import { eq, getTableColumns } from 'drizzle-orm';
import * as v from 'valibot';
import { query, getRequestEvent, form } from '$app/server';
import { $db } from '$lib/server/db';
import { updateProfileSchema } from './schemas';

export const getUser = query(v.string(), async (username) => {
	const { db } = getRequestEvent().locals;
	const [user] = await db.select().from($db.users).where(eq($db.users.username, username)).limit(1);
	if (!user) error(404);
	return user;
});

export const getProfile = query(v.string(), async (username) => {
	const { db } = getRequestEvent().locals;
	const [user] = await db
		.select({ ...getTableColumns($db.users), profile: $db.profiles })
		.from($db.users)
		.leftJoin($db.profiles, eq($db.users.id, $db.profiles.id))
		.where(eq($db.users.username, username))
		.limit(1);

	if (!user) error(404);
	return user;
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
