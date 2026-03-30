import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { relations, sql, type InferSelectModel } from 'drizzle-orm';

export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
export type GuestBookMessage = InferSelectModel<typeof guestbookMessages>;

export const guestbookMessages = sqliteTable('guestbook_messages', {
	id: integer().primaryKey(),
	name: text().notNull(),
	message: text().notNull(),
	country: text(),
	createdAt: text('created_at', { mode: 'text' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

export const users = sqliteTable('users', {
	id: integer().primaryKey(),
	username: text().notNull(),
	nickname: text(),
	githubID: integer('github_id').notNull().unique()
});

export const usersRelations = relations(users, ({ many }) => ({
	// profile: one(profiles),
	sessions: many(sessions)
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
		.references(() => users.id)
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userID],
		references: [users.id]
	})
}));

// platform.env.DB;
