// routes/login/github/callback/+server.ts
import { OAuth2RequestError } from 'arctic';
import { generateId } from 'lucia';
import { github } from '$lib/server/lucia';

import type { User } from '$lib/types';
import { dev } from '$app/environment';

export async function GET({ locals, cookies, url, fetch }): Promise<Response> {
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

		const [existingUser] = (await locals.sql`
      SELECT * FROM users
        WHERE github_id = ${githubUser.id}
    `) as [User?];

		if (existingUser) {
			const session = await locals.lucia.createSession(existingUser.id, {});
			const sessionCookie = locals.lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} else {
			const userId = generateId(15);
			await locals.sql`
        INSERT INTO users
          (id, github_id, username, nickname)
        VALUES
          (${userId}, ${githubUser.id}, ${githubUser.login}, ${githubUser.name})
      `;
			const session = await locals.lucia.createSession(userId, {});
			const sessionCookie = locals.lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}

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
