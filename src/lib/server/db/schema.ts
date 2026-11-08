import { relations, sql, type InferSelectModel } from 'drizzle-orm';
import {
	sqliteTable,
	text,
	integer,
	blob,
	primaryKey,
	unique,
	index,
} from 'drizzle-orm/sqlite-core';

export type User = InferSelectModel<typeof users>;
export type Profile = InferSelectModel<typeof profiles>;
export type Session = InferSelectModel<typeof sessions>;
export type Review = InferSelectModel<typeof reviews>;
export type Stack = InferSelectModel<typeof stacks>;
export type _PackageDB = InferSelectModel<typeof packages>;
export type Package = Expand<
	Omit<_PackageDB, 'expires'> & {
		keywords: string[];
	}
>;
export type GuestBookMessage = InferSelectModel<typeof guestbookMessages>;

export const guestbookMessages = sqliteTable('guestbook_messages', {
	id: integer().primaryKey(),
	name: text().notNull(),
	message: text().notNull(),
	country: text(),
	createdAt: text('created_at', { mode: 'text' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const users = sqliteTable(
	'users',
	{
		id: integer().primaryKey(),
		username: text().notNull(),
		nickname: text(),
		githubID: integer('github_id').notNull().unique(),
	},
	(t) => [index('users_username_idx').on(t.username)]
);

export const usersRelations = relations(users, ({ many, one }) => ({
	profile: one(profiles),
	sessions: many(sessions),
	likes: many(likesReviews),
	reviews: many(reviews),
	follows: many(usersFollows, { relationName: 'followers' }),
	following: many(usersFollows, { relationName: 'following' }),
	stacks: many(stacks),
}));

export const profiles = sqliteTable('profiles', {
	id: integer()
		.primaryKey()
		.references(() => users.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	bio: text(),
	url: text(),
});

export const usersFollows = sqliteTable(
	'users_follows',
	{
		userID: integer('user_id')
			.notNull()
			.references(() => users.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		following: integer()
			.notNull()
			.references(() => users.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
	},
	(t) => [
		primaryKey({ columns: [t.userID, t.following] }),
		index('users_follows_following_idx').on(t.following),
	]
);

export const usersFollowsRelations = relations(usersFollows, ({ one }) => ({
	followers: one(users, {
		relationName: 'followers',
		fields: [usersFollows.following],
		references: [users.id],
	}),
	following: one(users, {
		relationName: 'following',
		fields: [usersFollows.userID],
		references: [users.id],
	}),
}));

/** The favorite packages of a user, up to four, in the order the user chose. */
export const usersPackages = sqliteTable(
	'users_packages',
	{
		userID: integer('user_id')
			.notNull()
			.references(() => users.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		package: text().notNull(),
		position: integer().notNull(),
	},
	(t) => [unique().on(t.userID, t.position)]
);

export const sessions = sqliteTable('sessions', {
	id: text().primaryKey().notNull(),
	secretHash: blob('secret_hash').$type<Uint8Array>().notNull(),
	createdAt: integer('created_at').notNull(),
	userID: integer('user_id')
		.notNull()
		.references(() => users.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userID],
		references: [users.id],
	}),
}));

export const packages = sqliteTable('packages', {
	name: text().primaryKey(),
	description: text().notNull(),
	latest: text().notNull(),
	next: text(),
	license: text(),
	repository: text(),
	homepage: text(),
	expires: integer({ mode: 'timestamp' }).notNull(),
	modified: text(),
	// timestamp('expires', { withTimezone: true, mode: 'date' })
	// 	.notNull()
	// 	.default(sql`now() + INTERVAL '1 WEEK'`)
});

export const packagesKeywords = sqliteTable(
	'packages_keywords',
	{
		name: text()
			.notNull()
			.references(() => packages.name, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		keyword: text().notNull(),
	},
	(t) => [primaryKey({ columns: [t.name, t.keyword] })]
);

export const readmes = sqliteTable('readmes', {
	name: text()
		.primaryKey()
		.references(() => packages.name, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	value: text(),
	html: text(),
	expires: integer('expires', { mode: 'timestamp' }),
	url: text(),
});

export const reviews = sqliteTable(
	'reviews',
	{
		id: integer().primaryKey(),
		authorID: integer()
			.notNull()
			.references(() => users.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		packageID: text()
			.notNull()
			.references(() => packages.name, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
		version: text().notNull(),
		content: text().notNull(),
		rating: integer({ mode: 'number' }).notNull(),
		index: integer().notNull(),
	},
	(t) => [
		index('reviews_package_idx').on(t.packageID),
		index('reviews_author_idx').on(t.authorID),
	]
);

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
	reviewAuthor: one(users, {
		fields: [reviews.authorID],
		references: [users.id],
	}),
	likes: many(likesReviews),
}));

export const likesReviews = sqliteTable(
	'likes_reviews',
	{
		userID: integer('user_id')
			.notNull()
			.references(() => users.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		reviewID: integer('review_id').references(() => reviews.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	},
	(t) => [
		unique().on(t.userID, t.reviewID),
		index('likes_reviews_review_idx').on(t.reviewID),
	]
);

export const stacks = sqliteTable(
	'stacks',
	{
		id: integer().primaryKey(),
		author: integer().notNull(),
		name: text().notNull(),
		normalizedName: text().notNull(),
		description: text().notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$onUpdate(() => new Date()),
		index: integer(),
	},
	(t) => [index('stacks_author_idx').on(t.author)]
);

export const stacksPackages = sqliteTable(
	'stacks_packages',
	{
		stackID: integer('stack_id').references(() => stacks.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
		package: text(),
		position: integer().notNull().default(0),
		// .references(() => packages.name, {
		// 	onDelete: 'cascade',
		// 	onUpdate: 'cascade',
		// }),
	},
	(t) => [index('stacks_packages_stack_idx').on(t.stackID, t.position)]
);

export const stacksTags = sqliteTable(
	'stacks_tags',
	{
		stackID: integer('stack_id')
			.notNull()
			.references(() => stacks.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		tag: text().notNull(),
	},
	(t) => [index('stacks_tags_stack_idx').on(t.stackID, t.tag)]
);

export const stacksLikes = sqliteTable(
	'stacks_likes',
	{
		userID: integer('user_id')
			.notNull()
			.references(() => users.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		stackID: integer('stack_id').references(() => stacks.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	},
	(t) => [
		unique().on(t.userID, t.stackID),
		index('stacks_likes_stack_idx').on(t.stackID),
	]
);

export const stacksRelations = relations(stacks, ({ many, one }) => ({
	stacksToUsers: one(users, {
		fields: [stacks.author],
		references: [users.id],
	}),
	stacksToPackages: many(stacksPackages),
	tags: many(stacksTags),
	likes: many(stacksLikes),
}));

export const stacksTagsRelations = relations(stacksTags, ({ one }) => ({
	stack: one(stacks, {
		fields: [stacksTags.stackID],
		references: [stacks.id],
	}),
}));

export const stacksPackagesRelations = relations(stacksPackages, ({ one }) => ({
	stack: one(stacks, {
		fields: [stacksPackages.stackID],
		references: [stacks.id],
	}),
	package: one(packages, {
		fields: [stacksPackages.package],
		references: [packages.name],
	}),
}));
