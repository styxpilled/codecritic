import { parseIntSafe } from '$lib';
import { ok } from '$lib/server';

export const GET = async ({ locals, url }) => {
	const limit = Math.min(parseIntSafe(url.searchParams.get('limit'), 9), 25);
	const offset = parseIntSafe(url.searchParams.get('offset'), 0);

	const packages = await locals.sql`
    SELECT
      COUNT(reviews.package) reviews,
      packages.*
    FROM packages
      LEFT JOIN reviews
        ON reviews.package = packages.name
    GROUP BY packages.name
    ORDER BY COUNT(reviews.package) DESC, packages.name DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

	return ok(packages);
};
