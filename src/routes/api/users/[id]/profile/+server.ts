import { notFound, ok, unauthorized } from '$lib/server';
import type { Profile, User } from '$lib/types';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
	const [profile] = (await locals.sql`
    SELECT * FROM profiles
      WHERE id = ${params.id}
  `) as [Profile];

	if (!profile) {
		const [user] = (await locals.sql`
      SELECT * FROM users
        WHERE id = ${params.id}
    `) as [User];
		if (!user) throw notFound();
		const [createdProfile] = (await locals.sql`
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
	const changes: Profile = await request.json();
	const [profile]: [Profile] = await locals.sql`
    INSERT INTO profiles
      (id, bio, url, links)
    VALUES
      (${user.id}, ${changes.bio}, ${changes.url}, ${changes.links})
    ON CONFLICT (id) DO UPDATE
      SET bio = ${changes.bio?.slice(0, 512) || ''},
          url = ${changes.url?.slice(0, 512) || ''},
          links = ${changes.links?.slice(0, 2).map((link) => link.slice(0, 512))}
    RETURNING *
  `;

	return ok(profile);
};
