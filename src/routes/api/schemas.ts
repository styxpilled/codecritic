import * as v from 'valibot';

export const updateProfileSchema = v.object({
	nickname: v.optional(v.pipe(v.string(), v.maxLength(32))),
	bio: v.optional(v.pipe(v.string(), v.maxLength(255))),
	url: v.union([
		v.literal(''),
		v.pipe(v.string(), v.nonEmpty(), v.url(), v.maxLength(255)),
	]),
});

/** The user retypes their username to confirm an irreversible action. */
export const confirmUsernameSchema = v.object({
	confirm: v.string(),
});

export const genericSchema = v.object({
	limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(18))),
	page: v.optional(v.number(), 0),
});

/** Review list sorts. Each one is a subpath of a review list route. */
export const reviewSortSchema = v.picklist(['recent', 'popular']);

export type ReviewSort = v.InferOutput<typeof reviewSortSchema>;

export const getReviewSchema = v.variant('type', [
	v.object({
		type: v.literal('id'),
		id: v.number(),
	}),
	v.object({
		type: v.literal('name'),
		author: v.string(),
		package: v.string(),
		index: v.number(),
	}),
]);

export const createReviewSchema = v.object({
	pkg: v.string(),
	rating: v.pipe(
		// we use a picklist because of form remote functions
		v.union([v.picklist(['1']), v.string()]),
		v.toNumber(),
		v.minValue(1),
		v.maxValue(10)
	),
	// createdAt: v.pipe(v.number(), v.toMaxValue(new Date().getTime())),
	// rating: v.pipe(v.number(), v.minValue(1), v.maxValue(10)),
	content: v.pipe(v.string(), v.maxLength(2048)),
	version: v.union([v.picklist(['']), v.string()]),
	id: v.optional(v.number()),
});

/** A stack is addressed by its id, or by author, slug and index. */
export const getStackSchema = v.variant('type', [
	v.object({
		type: v.literal('id'),
		id: v.number(),
	}),
	v.object({
		type: v.literal('name'),
		name: v.string(),
		username: v.string(),
		index: v.number(),
	}),
]);

export const createStackSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty(), v.maxLength(64)),
	description: v.pipe(v.string(), v.maxLength(2048)),
	tags: v.array(v.string()),
	tagsString: v.optional(v.string(), ''),
	packages: v.array(v.string()),
	packagesString: v.optional(v.string(), ''),
});

export const updateStackSchema = v.object({
	...createStackSchema.entries,
	id: v.pipe(v.union([v.string(), v.number()]), v.toNumber()),
});

/** Four slots. Empty slots arrive as empty strings from the form. */
export const favoritesSchema = v.object({
	packages: v.pipe(v.array(v.string()), v.maxLength(4)),
});

export const updateFollowSchema = v.object({
	username: v.string(),
});
