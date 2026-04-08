import { relations, sql, type InferSelectModel } from 'drizzle-orm';
import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

export type User = InferSelectModel<typeof users>;
export type Profile = InferSelectModel<typeof profiles>;
export type Session = InferSelectModel<typeof sessions>;
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

export const users = sqliteTable('users', {
	id: integer().primaryKey(),
	username: text().notNull(),
	nickname: text(),
	githubID: integer('github_id').notNull().unique(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
	profile: one(profiles),
	sessions: many(sessions),
	// likes: many(likesReviews),
	// reviews: many(reviews),
	// follows: many(usersFollows),
	// following: many(usersFollows)
}));

export const sessions = sqliteTable('sessions', {
	id: text().primaryKey().notNull(),
	secretHash: blob('secret_hash').$type<Uint8Array>().notNull(),
	createdAt: integer('created_at').notNull(),
	userID: integer('user_id')
		.notNull()
		.references(() => users.id),
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
	// keywords: text().array(),
	latest: text().notNull(),
	next: text(),
	license: text(),
	repository: text(),
	homepage: text(),
	// author: text(),
	expires: integer({ mode: 'timestamp' }).notNull(),
	modified: text(),
	// timestamp('expires', { withTimezone: true, mode: 'date' })
	// 	.notNull()
	// 	.default(sql`now() + INTERVAL '1 WEEK'`)
});

export const packagesKeywords = sqliteTable('packages_keywords', {
	name: text()
		.notNull()
		.references(() => packages.name, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	keyword: text().notNull(),
});

// export const packageView = sqliteView('packages_full').as((qb) => {
// 	return qb
// 		.select({
// 			...getTableColumns(packages),
// 			keywords: sql<string[]>`json_group_array(packages_keywords.keyword)`.as('keywords'),
// 		})
// 		.from(packages)
// 		.leftJoin(packagesKeywords, eq(packages.name, packagesKeywords.name))
// 		.groupBy(packages.name);
// });

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
