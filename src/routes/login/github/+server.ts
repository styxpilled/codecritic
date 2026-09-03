import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { generateState } from 'arctic';
import { GitHub } from 'arctic';

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const GITHUB_CLIENT_ID = event.platform?.env.GITHUB_CLIENT_ID;
	const GITHUB_CLIENT_SECRET = event.platform?.env.GITHUB_CLIENT_SECRET;
	if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
		throw error(500, 'CANNOT READ GITHUB SECRETS FROM ENVIRONMENT');
	}
	const gh = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, null);
	const url = gh.createAuthorizationURL(state, []);

	event.cookies.set('github_oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax',
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString(),
		},
	});
}
