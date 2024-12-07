import { notFound, ok, serverError, unauthorized } from '$lib/server';
import { reviewSalt } from '$lib/server/database';
import type { Review } from '$lib/types';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
	const userID = locals.user?.id || '';

	const [review] = await locals.sql`
    SELECT
      reviews.*,
      extensions.id_encode(reviews.id, ${reviewSalt}, 4) id,
      (user_id = ${userID} AND user_id IS NOT NULL) liked,
      row_to_json (users.*) author,
      COUNT(review_id)::integer likes
    FROM reviews
      LEFT JOIN users
        ON users.id = reviews.author
      LEFT JOIN likes_reviews
        ON reviews.id = review_id
      WHERE reviews.id = extensions.id_decode_once(${params.id}, ${reviewSalt}, 4)
    GROUP BY reviews.id, users.*, user_id, review_id
  `;

	return ok(review);
};

export const PUT: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.user) throw unauthorized();
	try {
		const [currentReview] = (await locals.sql`
      SELECT * FROM reviews
        WHERE id = extensions.id_decode_once(${params.id}, ${reviewSalt}, 4)
    `) as [(Review & { author: number })?];

		if (!currentReview) throw notFound();
		if (currentReview.author !== locals.user.id) throw unauthorized();

		const editedReview: Review = await request.json();

		const [review] = (await locals.sql`
      UPDATE reviews
        SET review = ${editedReview.review},
            rating = ${editedReview.rating}
        WHERE id = extensions.id_decode_once(${params.id}, ${reviewSalt}, 4)
      RETURNING *
    `) as [Review];
		return ok(review);
	} catch (e) {
		console.error(e);
		throw serverError();
	}
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) throw unauthorized();
	try {
		const [currentReview]: [(Review & { author: number })?] = await locals.sql`
      SELECT * FROM reviews
        WHERE id = extensions.id_decode_once(${params.id}, ${reviewSalt}, 4);
    `;

		if (!currentReview) throw notFound();
		if (currentReview.author !== locals.user.id) throw unauthorized();

		await locals.sql`
      DELETE FROM reviews
        WHERE id = extensions.id_decode_once(${params.id}, ${reviewSalt}, 4) AND author = ${locals.user.id}
    `;
		return ok();
	} catch (e) {
		console.error(e);
		throw serverError();
	}
};
