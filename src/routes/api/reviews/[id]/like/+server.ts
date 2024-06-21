import { ok, unauthorized } from '$lib/server';
import { reviewSalt, sql } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, params }) => {
	const user = locals.user;

	if (user === null) throw unauthorized();
	await sql`
    INSERT INTO likes_reviews
      (review_id, user_id)
    VALUES
      (extensions.id_decode_once(${params.id}, ${reviewSalt}, 4), ${user.id})
  `;

	return ok();
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const user = locals.user;

	if (user === null) throw unauthorized();
	await sql`
    DELETE FROM likes_reviews
      WHERE 
        review_id = extensions.id_decode_once(${params.id}, ${reviewSalt}, 4)
      AND
        user_id = ${user.id}
  `;

	return ok();
};
