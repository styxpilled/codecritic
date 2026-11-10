import { error, redirect } from '@sveltejs/kit';
import { and, count, desc, eq, getTableColumns, gt, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import * as v from 'valibot';
import { normalizeName, optSubpath } from '#lib';
import { $db, chunkRows, toStringArr } from '#lib/server/db/index.ts';
import { query, getRequestEvent, form } from '$app/server';
import {
	createStackSchema,
	genericSchema,
	getStackSchema,
	updateStackSchema,
} from './schemas';

/**
 * The packages of the selected stack, in author order. The order lives in a
 * subquery because `json_group_array` takes no `ORDER BY`.
 */
const packagesArr = sql`(
	SELECT json_group_array(package)
	FROM (
		SELECT package FROM stacks_packages
		WHERE stack_id = ${$db.stacks.id}
		ORDER BY position
	)
)`.mapWith(toStringArr);

const tagsArr = sql`(
	SELECT json_group_array(tag)
	FROM (SELECT tag FROM stacks_tags WHERE stack_id = ${$db.stacks.id} ORDER BY tag)
)`.mapWith(toStringArr);

/** Whether the signed in user likes the selected stack. */
const likedFlag = (viewerID: number) =>
	sql`EXISTS (SELECT 1 FROM stacks_likes WHERE stack_id = ${$db.stacks.id} AND user_id = ${viewerID})`.mapWith(
		Boolean
	);

const stackColumns = (viewerID: number) => ({
	...getTableColumns($db.stacks),
	author: getTableColumns($db.users),
	packages: packagesArr,
	tags: tagsArr,
	liked: likedFlag(viewerID),
});

const stackCond = (obj: v.InferOutput<typeof getStackSchema>) =>
	obj.type === 'name'
		? and(
				eq($db.stacks.normalizedName, obj.name),
				eq($db.users.username, obj.username),
				eq($db.stacks.index, obj.index)
			)
		: eq($db.stacks.id, obj.id);

export const getStack = query(getStackSchema, async (obj) => {
	const { db, user } = getRequestEvent().locals;
	const [stack] = await db
		.select(stackColumns(user?.id ?? -1))
		.from($db.stacks)
		.innerJoin($db.users, eq($db.stacks.author, $db.users.id))
		.where(stackCond(obj));
	return stack;
});

export const getRecentStacks = query(genericSchema, async ({ limit = 10 }) => {
	const { db, user } = getRequestEvent().locals;
	const stacks = await db
		.select(stackColumns(user?.id ?? -1))
		.from($db.stacks)
		.innerJoin($db.users, eq($db.stacks.author, $db.users.id))
		.orderBy(desc($db.stacks.createdAt))
		.limit(limit);
	return stacks;
});

export const getPopularStacks = query(genericSchema, async ({ limit = 10 }) => {
	const { db, user } = getRequestEvent().locals;
	const stacks = await db
		.select(stackColumns(user?.id ?? -1))
		.from($db.stacks)
		.innerJoin($db.users, eq($db.stacks.author, $db.users.id))
		.orderBy(desc($db.stacks.likes), desc($db.stacks.createdAt))
		.limit(limit);
	return stacks;
});

export const getUserStacks = query(v.string(), async (username) => {
	const { db, user } = getRequestEvent().locals;
	const stacks = await db
		.select(stackColumns(user?.id ?? -1))
		.from($db.stacks)
		.innerJoin($db.users, eq($db.stacks.author, $db.users.id))
		.where(eq($db.users.username, username))
		.orderBy(desc($db.stacks.createdAt));
	return stacks;
});

export const getLikedStacks = query(v.string(), async (username) => {
	const { db, user } = getRequestEvent().locals;
	const viewer = alias($db.users, 'viewer');
	const stacks = await db
		.select(stackColumns(user?.id ?? -1))
		.from($db.stacksLikes)
		.innerJoin($db.stacks, eq($db.stacksLikes.stackID, $db.stacks.id))
		.innerJoin($db.users, eq($db.stacks.author, $db.users.id))
		.innerJoin(viewer, eq($db.stacksLikes.userID, viewer.id))
		.where(eq(viewer.username, username))
		.orderBy(desc($db.stacks.createdAt));
	return stacks;
});

export const getStackLikes = query(getStackSchema, async (obj) => {
	const { db } = getRequestEvent().locals;
	const author = alias($db.users, 'author');
	const users = await db
		.select({ ...getTableColumns($db.users) })
		.from($db.stacksLikes)
		.innerJoin($db.stacks, eq($db.stacksLikes.stackID, $db.stacks.id))
		.innerJoin(author, eq($db.stacks.author, author.id))
		.innerJoin($db.users, eq($db.stacksLikes.userID, $db.users.id))
		.where(
			obj.type === 'name'
				? and(
						eq($db.stacks.normalizedName, obj.name),
						eq(author.username, obj.username),
						eq($db.stacks.index, obj.index)
					)
				: eq($db.stacks.id, obj.id)
		);
	return users;
});

export const likeStack = form(
	v.object({ _id: v.number() }),
	async ({ _id: id }) => {
		const { db, user } = getRequestEvent().locals;
		if (!user) error(401);
		await db
			.insert($db.stacksLikes)
			.values({ userID: user.id, stackID: id })
			.onConflictDoNothing();
	}
);

export const unlikeStack = form(
	v.object({ _id: v.number() }),
	async ({ _id: id }) => {
		const { db, user } = getRequestEvent().locals;
		if (!user) error(401);
		await db
			.delete($db.stacksLikes)
			.where(
				and(
					eq($db.stacksLikes.userID, user.id),
					eq($db.stacksLikes.stackID, id)
				)
			);
	}
);

/** Split a comma separated no-JS field, or clean the list the rich UI built. */
const toList = (list: string[], fallback: string) => {
	const source = fallback !== '' ? fallback.split(',') : list;
	return [...new Set(source.map((item) => item.trim()).filter(Boolean))];
};

/** Replace the package and tag rows of a stack. */
const writeChildren = async (
	db: App.Locals['db'],
	stackID: number,
	packages: string[],
	tags: string[]
) => {
	await db
		.delete($db.stacksPackages)
		.where(eq($db.stacksPackages.stackID, stackID));
	await db.delete($db.stacksTags).where(eq($db.stacksTags.stackID, stackID));
	const inserts = [
		...chunkRows(
			packages.map((pkg, position) => ({ package: pkg, stackID, position }))
		).map((rows) => db.insert($db.stacksPackages).values(rows)),
		...chunkRows(tags.map((tag) => ({ tag, stackID }))).map((rows) =>
			db.insert($db.stacksTags).values(rows)
		),
	];
	const [first, ...rest] = inserts;
	if (first) await db.batch([first, ...rest]);
};

/** How many stacks the author already has under the same slug. */
const nextIndex = async (
	db: App.Locals['db'],
	authorID: number,
	normalized: string
) => {
	const [info] = await db
		.select({ count: count() })
		.from($db.stacks)
		.where(
			and(
				eq($db.stacks.author, authorID),
				eq($db.stacks.normalizedName, normalized)
			)
		);
	return info.count;
};

export const createStack = form(
	createStackSchema,
	async ({ name, description, tags, packages, packagesString, tagsString }) => {
		const { db, user } = getRequestEvent().locals;
		if (!user) error(401);
		const normalized = normalizeName(name);
		const [stack] = await db
			.insert($db.stacks)
			.values({
				author: user.id,
				createdAt: new Date(),
				name,
				description,
				normalizedName: normalized,
				index: await nextIndex(db, user.id, normalized),
			})
			.returning();
		await writeChildren(
			db,
			stack.id,
			toList(packages, packagesString),
			toList(tags, tagsString)
		);
		redirect(
			303,
			`/user/${user.username}/stack/${normalized}/${optSubpath(stack.index)}`
		);
	}
);

export const updateStack = form(
	updateStackSchema,
	async ({
		id,
		name,
		description,
		tags,
		packages,
		packagesString,
		tagsString,
	}) => {
		const { db, user } = getRequestEvent().locals;
		if (!user) error(401);
		const [current] = await db
			.select()
			.from($db.stacks)
			.where(and(eq($db.stacks.id, id), eq($db.stacks.author, user.id)));
		if (!current) error(404);
		const normalized = normalizeName(name);
		// A rename moves the stack to another slug, so it takes that slug's index.
		const index =
			normalized === current.normalizedName
				? current.index
				: await nextIndex(db, user.id, normalized);
		await db
			.update($db.stacks)
			.set({ name, description, normalizedName: normalized, index })
			.where(eq($db.stacks.id, id));
		await writeChildren(
			db,
			id,
			toList(packages, packagesString),
			toList(tags, tagsString)
		);
		redirect(
			303,
			`/user/${user.username}/stack/${normalized}/${optSubpath(index)}`
		);
	}
);

export const deleteStack = form(
	v.object({ id: v.number() }),
	async ({ id }) => {
		const { db, user } = getRequestEvent().locals;
		if (!user) error(401);
		const [stack] = await db
			.delete($db.stacks)
			.where(and(eq($db.stacks.id, id), eq($db.stacks.author, user.id)))
			.returning();
		if (!stack) error(404);
		await db
			.update($db.stacks)
			.set({ index: sql`${$db.stacks.index} - 1` })
			.where(
				and(
					eq($db.stacks.author, user.id),
					eq($db.stacks.normalizedName, stack.normalizedName),
					gt($db.stacks.index, stack.index ?? 0)
				)
			);
		redirect(303, `/user/${user.username}`);
	}
);
