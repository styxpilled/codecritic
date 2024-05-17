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
      followers.user_id = ${userID} user_follows,
      COUNT(DISTINCT reviews.id)::int reviews
    FROM users
    LEFT JOIN reviews as reviews
      ON users.id = reviews.author
	  LEFT JOIN users_follows as followers
      ON users.id = followers.following
	  LEFT JOIN users_follows AS following
      ON users.id = following.user_id     
    WHERE users.id = ${params.id}
    GROUP BY users.id, following.user_id, followers.user_id
  `) as [User?];
	if (!requestedUser) throw notFound();

	return ok(requestedUser);
};
