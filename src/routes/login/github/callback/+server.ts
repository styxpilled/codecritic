// routes/login/github/callback/+server.ts
import { error } from '@sveltejs/kit';
import { GitHub, OAuth2RequestError } from 'arctic';
// import { $db, db } from '$db';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { createSession, setSessionTokenCookie } from '#lib/server/auth.ts';
import { $db } from '#lib/server/db/index.ts';
import { dev } from '$app/env';

export async function GET({ cookies, url, fetch, locals }): Promise<Response> {
	const db = locals.db;
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('github_oauth_state') ?? null;

	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400,
		});
	}

	const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID;
	const GITHUB_CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;
	if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
		throw error(500, 'CANNOT READ GITHUB SECRETS FROM ENVIRONMENT');
	}
	const gh = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, null);

	try {
		const tokens = await gh.validateAuthorizationCode(code);

		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`,
				'User-Agent': 'codecritic',
			},
		});
		const githubUser: GitHubUser = await githubUserResponse.json();

		const [existingUser] = await db
			.select()
			.from($db.users)
			.where(eq($db.users.githubID, githubUser.id));

		if (existingUser) {
			const session = await createSession(db, existingUser);
			setSessionTokenCookie(cookies, session);
		} else {
			const [user] = await db
				.insert($db.users)
				.values({
					githubID: githubUser.id,
					username: githubUser.login,
					nickname: githubUser.name,
				})
				.returning();
			await db.insert($db.profiles).values({
				id: user.id,
			});
			const session = await createSession(db, user);
			setSessionTokenCookie(cookies, session);
		}

		cookies.set('github_access_token', tokens.accessToken(), {
			path: '/',
			secure: !dev,
			httpOnly: true,
			maxAge: 60 * 10000,
			sameSite: 'lax',
		});

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
			},
		});
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			return new Response(null, {
				status: 400,
			});
		}
		console.error(e);
		return new Response(null, {
			status: 500,
		});
	}
}

interface GitHubUser {
	id: number;
	login: string;
	name: string;
}
