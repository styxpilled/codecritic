// routes/login/github/callback/+server.ts
import { OAuth2RequestError } from 'arctic';
import { github } from '$lib/server/lucia';

// import type { User } from '$db/index.js';
import { dev } from '$app/environment';
import { $pg, db } from '$db';
import { eq } from 'drizzle-orm';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';

export async function GET({ cookies, url, fetch }): Promise<Response> {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('github_oauth_state') ?? null;

	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const tokens = await github.validateAuthorizationCode(code);
		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
				'User-Agent': 'codecritic'
			}
		});
		const githubUser: GitHubUser = await githubUserResponse.json();

		const [existingUser] = await db
			.select()
			.from($pg.users)
			.where(eq($pg.users.github_id, githubUser.id));

		if (existingUser) {
			const token = generateSessionToken();
			const session = await createSession(token, existingUser.id);
			setSessionTokenCookie(cookies, session);
		} else {
			const [user] = await db
				.insert($pg.users)
				.values({
					github_id: githubUser.id,
					username: githubUser.login,
					nickname: githubUser.name
				})
				.returning();
			const token = generateSessionToken();
			const session = await createSession(token, user.id);
			setSessionTokenCookie(cookies, session);
		}

		console.log(cookies.get('session'));

		cookies.set('github_access_token', tokens.accessToken, {
			path: '/',
			secure: !dev,
			httpOnly: true,
			maxAge: 60 * 10000,
			sameSite: 'lax'
		});

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	} catch (e) {
		console.log(e);

		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
			// invalid code
			return new Response(null, {
				status: 400
			});
		}

		return new Response(null, {
			status: 500
		});
	}
}

interface GitHubUser {
	id: number;
	login: string;
	name: string;
}
