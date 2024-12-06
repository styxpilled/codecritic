import { type User, type Session, sessions } from '$db/schema';
import type { Cookies } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import { db, $pg } from '$db';
import { dev } from '$app/environment';

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(token: string, userId: number): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	}; //        ^ 30 days
	await db.insert(sessions).values(session);
	return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	// const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const sessionId = token;
	const result = await db
		.select({ user: $pg.users, session: $pg.sessions })
		.from($pg.sessions)
		.innerJoin($pg.users, eq($pg.sessions.userId, $pg.users.id))
		.where(eq($pg.sessions.id, sessionId));

	if (result.length < 1) {
		return { session: null, user: null };
	}
	const { user, session } = result[0];
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete($pg.sessions).where(eq($pg.sessions.id, session.id));
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update($pg.sessions)
			.set({
				expiresAt: session.expiresAt
			})
			.where(eq($pg.sessions.id, session.id));
	}
	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete($pg.sessions).where(eq($pg.sessions.id, sessionId));
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export function setSessionTokenCookie(cookies: Cookies, session: Session) {
	const secure = !dev;
	cookies.set('session', session.id, {
		httpOnly: true,
		secure: secure,
		sameSite: 'lax',
		expires: session.expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(cookies: Cookies) {
	cookies.delete('session', {
		path: '/'
	});
}
