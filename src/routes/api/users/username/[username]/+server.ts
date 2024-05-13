import { notFound, ok } from '$lib/server';
import { sql } from '$lib/server/database';
import type { User } from 'lucia';

export const GET = async ({ params, locals }) => {
	const userID = locals.user?.id || null;

	const [requestedUser] = (await sql`
    SELECT 
      users.*,
      COUNT(following.user_id) following,
      COUNT(followers.user_id) followers,
      following.following = ${userID} follows_user,
      followers.user_id = ${userID} user_follows,
      COUNT(reviews.id) reviews
      FROM users
      LEFT JOIN users_follows AS following
        ON users.id = following.user_id
      LEFT JOIN users_follows as followers
        ON users.id = followers.following
      LEFT JOIN reviews
        ON users.id = reviews.author
      WHERE username = ${params.username}
      GROUP BY users.id, following.following, followers.user_id, reviews.id
  `) as [User?];
	if (!requestedUser) throw notFound();

	console.log(requestedUser);

	return ok(requestedUser);
};
