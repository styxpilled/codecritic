import * as v from 'valibot';

export const updateProfileSchema = v.object({
	nickname: v.optional(v.string()),
	bio: v.optional(v.pipe(v.string(), v.maxLength(255))),
	url: v.union([v.literal(''), v.pipe(v.string(), v.nonEmpty(), v.url())]),
});

export const updateFollowSchema = v.object({
	username: v.string(),
});
