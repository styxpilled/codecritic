// routes/login/github/callback/+server.ts
import { OAuth2RequestError } from 'arctic';
import { generateId } from 'lucia';
import { github, lucia } from '$lib/server/lucia';

import { sql } from '$lib/server/database';
import type { User } from '$lib/types';

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

		const [existingUser]: [User?] = await sql`
      SELECT * FROM users
        WHERE github_id = ${githubUser.id}
    `;

		if (existingUser) {
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} else {
			const userId = generateId(15);

			await sql`
        INSERT INTO users
          ${sql({
						id: userId,
						github_id: githubUser.id,
						username: githubUser.login,
						nickname: githubUser.name
					})}    
      `;
			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}
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
