import { notFound, ok, unauthorized } from '$lib/server';
import { sql } from '$lib/server/database';
import type { Profile, User } from '$lib/types';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const [profile] = (await sql`
    SELECT * FROM profiles
      WHERE id = ${params.id}
  `) as [Profile];

	if (!profile) {
		const [user] = (await sql`
      SELECT * FROM users
        WHERE id = ${params.id}
    `) as [User];
		if (!user) throw notFound();
		const [createdProfile] = (await sql`
      INSERT INTO profiles
        (id, bio, url, links)
      VALUES
        (${user.id}, ${''}, ${''}, ${[]})
      `) as [Profile];
		return ok(createdProfile);
	}
	return ok(profile);
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) throw unauthorized();
	const changes = await request.json();
	const [profile] = (await sql`
    INSERT INTO profiles
      (id, bio, url, links)
    VALUES
      (${user.id}, ${changes.bio}, ${changes.url}, ${changes.links})
    ON CONFLICT (id) DO UPDATE
      SET bio = ${changes.bio},
          url = ${changes.url},
          links = ${changes.links}
    RETURNING *
  `) as [Profile];

	return ok(profile);
};
