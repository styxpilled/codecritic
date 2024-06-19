import type { RequestHandler } from './$types';
import type { User } from 'lucia';
import { notFound, ok } from '$lib/server';
import { sql } from '$lib/server/database';

export const GET: RequestHandler = async ({ params, locals }) => {
	const userID = locals.user?.id || null;

	const [requestedUser] = (await sql`
    SELECT 
      users.*,
      COUNT(DISTINCT following.following)::int following,
      COUNT(DISTINCT followers.user_id)::int followers,
      -- We need this to not GROUP BY followers.following
      ${userID} = ANY(ARRAY_AGG(following.following)) follows_user,
      ${userID} = ANY(ARRAY_AGG(followers.user_id)) user_follows,
      COUNT(DISTINCT reviews.id)::int reviews
    FROM users
    LEFT JOIN reviews AS reviews
      ON users.id = reviews.author
	  LEFT JOIN users_follows AS followers
      ON users.id = followers.following
	  LEFT JOIN users_follows AS following
      ON users.id = following.user_id     
    WHERE users.id = ${params.id}
    GROUP BY users.id, following.user_id, followers.following
  `) as [User?];
	if (!requestedUser) throw notFound();

	return ok(requestedUser);
};
