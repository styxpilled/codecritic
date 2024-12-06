import { relations, sql, type InferSelectModel } from 'drizzle-orm';
import {
	pgTable,
	text,
	boolean,
	integer,
	timestamp,
	smallint,
	primaryKey,
	check
} from 'drizzle-orm/pg-core';

export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
export type Package = InferSelectModel<typeof packages>;

export const users = pgTable('users', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	username: text().notNull(),
	nickname: text(),
	github_id: integer().notNull().unique()
});

export const usersRelations = relations(users, ({ one, many }) => ({
	profile: one(profiles),
	sessions: many(sessions),
	likes: many(likesReviews),
	reviews: many(reviews),
	follows: many(usersFollows),
	following: many(usersFollows)
}));

export const sessions = pgTable('user_session', {
	id: text().primaryKey(),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id)
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const profiles = pgTable('profiles', {
	id: integer()
		.primaryKey()
		.references(() => users.id),
	bio: text(),
	url: text(),
	links: text().array()
});

export const profilesRelations = relations(profiles, ({ one }) => ({
	user: one(users, {
		fields: [profiles.id],
		references: [users.id]
	})
}));

export const usersFollows = pgTable(
	'users_follows',
	{
		userId: integer('user_id')
			.notNull()
			.references(() => users.id),
		following: integer()
			.notNull()
			.references(() => users.id)
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.following] })
	})
);

export const packages = pgTable('packages', {
	name: text().primaryKey(),
	description: text().notNull(),
	keywords: text().array(),
	latest: text().notNull(),
	next: text(),
	license: text(),
	repository: text(),
	homepage: text(),
	author: text(),
	public: boolean()
});

export const packagesRelations = relations(packages, ({ many }) => ({
	stacks: many(stacksPackages)
}));

export const reviews = pgTable(
	'reviews',
	{
		id: integer().primaryKey(),
		// TODO: rename to reviewId
		author: integer()
			.notNull()
			.references(() => users.id),
		// TODO: rename to packageId
		package: text()
			.notNull()
			.references(() => packages.name),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
		version: text().notNull(),
		// TODO: rename to content
		review: text().notNull(),
		rating: smallint().notNull()
	},
	(table) => ({
		checkConstraint: check('age_check1', sql`${table.rating} < 10`)
	})
);

export const likesReviews = pgTable(
	'likes_reviews',
	{
		userId: integer('user_id').notNull(),
		// .references(() => users.id),
		reviewId: integer('review_id')
		// .references(() => reviews.id),
	}
	// (t) => ({
	// 	pk: primaryKey({ columns: [t.userId, t.reviewId] })
	// })
);

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
	reviewAuthor: one(users),
	likes: many(likesReviews)
}));

export const usersToReview = relations(likesReviews, ({ one }) => ({
	user: one(users, {
		fields: [likesReviews.userId],
		references: [users.id]
	}),
	review: one(reviews, {
		fields: [likesReviews.reviewId],
		references: [reviews.id]
	})
}));

export const stacks = pgTable('stacks', {
	id: integer().primaryKey(),
	author: text().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.$onUpdate(() => new Date())
});

export const stacksRelations = relations(stacks, ({ many, one }) => ({
	stacksToUsers: one(users, {
		fields: [stacks.author],
		references: [users.id]
	}),
	stacksToPackages: many(stacksPackages)
}));

export const stacksPackages = pgTable(
	'stacks_packages',
	{
		stackId: integer('stack_id'),
		// .references(() => stacks.id),
		package: text()
		// .references(() => packages.name)
	}
	// (t) => ({
	// 	pk: primaryKey({ columns: [t.stackId, t.package] })
	// })
);

export const stacksToPackages = relations(likesReviews, ({ one }) => ({
	user: one(users, {
		fields: [likesReviews.userId],
		references: [users.id]
	}),
	review: one(reviews, {
		fields: [likesReviews.reviewId],
		references: [reviews.id]
	})
}));
