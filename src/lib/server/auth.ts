import { GitHub } from 'arctic';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';
import { $db, type DrizzleClient } from './db';
import { sessions, type Session, type User } from './db/schema';
import type { Cookies } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, null);

export const getDays = (days: number) => 1000 * 60 * 60 * 24 * days;
const SESSION_LIFESPAN = getDays(30);
export const CODECRITIC_SESSION_COOKIE = 'codecritic_session';

export type InternalSession = {
	id: string;
	token: string;
	createdAt: Date;
};

export async function createSession(db: DrizzleClient, user: User): Promise<InternalSession> {
	const id = generateSecureRandomString();
	const secret = generateSecureRandomString();
	const secretHash = await hashSecret(secret);
	const now = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
	const token = id + '.' + secret;

	await db.insert(sessions).values({
		id,
		secretHash,
		createdAt: Math.floor(now.getTime() / 1000),
		userID: user.id
	});

	return {
		id,
		token,
		createdAt: now
	};
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export async function validateSessionToken(
	db: DrizzleClient,
	token: string
): Promise<SessionValidationResult> {
	const tokenParts = token.split('.');
	if (tokenParts.length !== 2) {
		return { session: null, user: null };
	}
	const sessionId = tokenParts[0];
	const sessionSecret = tokenParts[1];

	const result = await db
		.select()
		.from($db.sessions)
		.innerJoin($db.users, eq($db.sessions.userID, $db.users.id))
		.where(eq($db.sessions.id, sessionId));

	if (result.length < 1) {
		return { session: null, user: null };
	}
	const { users: user, sessions: session } = result[0];
	if (Date.now() >= session.createdAt * 1000 + SESSION_LIFESPAN) {
		await db.delete($db.sessions).where(eq($db.sessions.id, session.id));
		return { session: null, user: null };
	}

	if (!session) {
		return { session: null, user: null };
	}

	const tokenSecretHash = await hashSecret(sessionSecret);
	const validSecret = constantTimeEqual(tokenSecretHash, session.secretHash);
	if (!validSecret) {
		return { session: null, user: null };
	}

	return { session, user };
}

export function setSessionTokenCookie(cookies: Cookies, session: InternalSession) {
	cookies.set(CODECRITIC_SESSION_COOKIE, session.token, {
		// httpOnly: true,
		// secure: secure,
		sameSite: 'lax',
		expires: new Date(session.createdAt.getTime() + SESSION_LIFESPAN),
		path: '/'
	});
}

export function deleteSessionTokenCookie(cookies: Cookies) {
	cookies.delete('session', {
		path: '/'
	});
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.byteLength !== b.byteLength) {
		return false;
	}
	let c = 0;
	for (let i = 0; i < a.byteLength; i++) {
		c |= a[i] ^ b[i];
	}
	return c === 0;
}

async function hashSecret(secret: string): Promise<Uint8Array> {
	const secretBytes = new TextEncoder().encode(secret);
	const secretHashBuffer = await crypto.subtle.digest('SHA-256', secretBytes);
	return new Uint8Array(secretHashBuffer);
}

function generateSecureRandomString(): string {
	// Human readable alphabet (a-z, 0-9 without l, o, 0, 1 to avoid confusion)
	const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';
	// Generate 24 bytes = 192 bits of entropy.
	// We're only going to use 5 bits per byte so the total entropy will be 192 * 5 / 8 = 120 bits
	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);
	let id = '';
	for (let i = 0; i < bytes.length; i++) {
		// >> 3 "removes" the right-most 3 bits of the byte
		id += alphabet[bytes[i] >> 3];
	}
	return id;
}
