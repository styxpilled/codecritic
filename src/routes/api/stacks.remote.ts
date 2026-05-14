import { error, redirect } from '@sveltejs/kit';
import { and, desc, eq, getTableColumns, gt, ilike, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import * as v from 'valibot';
import { query, getRequestEvent, form } from '$app/server';
import { normalizeName } from '$lib';
import { getDays } from '$lib/server/auth';
import { $db, toStringArr } from '$lib/server/db';
import {
	createStackSchema,
	genericSchema,
	updateFollowSchema,
	updateProfileSchema,
} from './schemas';

export const getStack = query(
	v.union([
		v.object({
			id: v.number(),
			name: v.optional(v.undefined()),
		}),
		v.object({
			id: v.optional(v.undefined()),
			name: v.string(),
			username: v.string(),
			index: v.number(),
		}),
	]),
	async (obj) => {
		const { db, user } = getRequestEvent().locals;
		let cond;
		if (obj?.id) {
			cond = eq($db.stacks.id, obj.id);
		}
		if (obj.name) {
			cond = and(
				eq($db.stacks.normalizedName, obj.name),
				eq($db.users.username, obj.username),
				eq($db.stacks.index, obj.index)
			);
		}
		const [stack] = await db
			.select({
				...getTableColumns($db.stacks),
				author: getTableColumns($db.users),
				packages: sql`json_group_array(stacks_packages.package)`
					.mapWith(toStringArr)
					.as('packages'),
			})
			.from($db.stacks)
			.innerJoin($db.users, eq($db.stacks.author, $db.users.id))
			.leftJoin($db.stacksPackages, eq($db.stacks.id, $db.stacksPackages.stackID))
			.where(cond);
		return stack;
	}
);

export const getRecentStacks = query(genericSchema, async ({ page, limit = 10 }) => {
	const { db, user } = getRequestEvent().locals;
	const stacks = await db
		.select({
			...getTableColumns($db.stacks),
			author: getTableColumns($db.users),
		})
		.from($db.stacks)
		.innerJoin($db.users, eq($db.stacks.author, $db.users.id))
		.orderBy(desc($db.stacks.createdAt))
		.limit(limit);
	return stacks;
});

export const createStack = form(
	createStackSchema,
	async ({ name, description, tags, packages, packagesString, tagsString }) => {
		const { db, user } = getRequestEvent().locals;
		console.log(packages);
		console.log(tags);
		console.log(packagesString);
		console.log(tagsString);
		try {
			if (!user) error(401);
			const normalized = normalizeName(name);
			const existing = await db
				.select()
				.from($db.stacks)
				.where(and(eq($db.stacks.author, user.id), eq($db.stacks.normalizedName, normalized)));
			const [stack] = await db
				.insert($db.stacks)
				.values({
					author: user.id,
					createdAt: new Date(),
					name,
					description,
					normalizedName: normalized,
					index: existing.length,
				})
				.returning();
			await db.delete($db.stacksPackages).where(eq($db.stacksPackages.stackID, stack.id));
			if (packagesString !== '') {
				packages = packagesString.split(',');
			}
			packages = packages.map((v) => v.trim());
			if (packages.length) {
				await db.insert($db.stacksPackages).values(
					packages.map((v) => ({
						package: v,
						stackID: stack.id,
					}))
				);
			}
		} catch (error) {
			console.log(error);
		}
		// redirect(303, `/user/${user.username}/stack/${stack.name}`);
		// return { ...stack, packages };
	}
);
