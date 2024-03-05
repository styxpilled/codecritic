import { ok } from '$lib/server';
import { sql } from '$lib/server/database';

export const GET = async () => {
	const packages = await sql`
    SELECT
      COUNT(reviews.package) reviews,
      packages.*
    FROM packages
      LEFT JOIN reviews
        ON reviews.package = packages.name
      GROUP BY packages.name
      ORDER BY COUNT(reviews.package) DESC, packages.name DESC
  `;

	return ok(packages);
};
