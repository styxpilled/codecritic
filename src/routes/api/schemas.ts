import * as v from 'valibot';

export const updateProfileSchema = v.object({
	nickname: v.optional(v.string()),
	bio: v.optional(v.pipe(v.string(), v.maxLength(255))),
	url: v.union([v.literal(''), v.pipe(v.string(), v.nonEmpty(), v.url())]),
});

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
	// rating: v.pipe(v.number(), v.minValue(1), v.maxValue(10)),
	content: v.pipe(v.string(), v.maxLength(2048)),
	version: v.union([v.picklist(['']), v.string()]),
	id: v.optional(v.number()),
});

export const updateFollowSchema = v.object({
	username: v.string(),
});
