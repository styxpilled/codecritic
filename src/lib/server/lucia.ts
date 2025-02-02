import type { DBUser } from '$lib/types';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';
// import { PostgresJsAdapter } from '@lucia-auth/adapter-postgresql';
// import { NeonHTTPAdapter } from '@lucia-auth/adapter-postgresql';
import { GitHub } from 'arctic';
import { Lucia } from 'lucia';
// import { dev } from '$app/environment';

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET);

// export const adapter = new NeonHTTPAdapter(locals.sql, {
// 	user: 'users',
// 	session: 'user_session'
// });

// export const lucia = new Lucia(adapter, {
// 	sessionCookie: {
// 		attributes: {
// 			// set to `true` when using HTTPS
// 			secure: !dev
// 		}
// 	},
// 	getUserAttributes: (attributes) => {
// 		return {
// 			githubId: attributes.github_id,
// 			username: attributes.username,
// 			nickname: attributes.nickname
// 		};
// 	}
// });

declare module 'lucia' {
	interface Register {
		Lucia: Lucia<{
			githubId: string;
		}>;
		DatabaseUserAttributes: DBUser;
	}
}
