import { ok } from '$lib/server';
import { sql } from '$lib/server/database';
import type { Review } from '$lib/types';

export const GET = async () => {
	const packages = (await sql`
    SELECT
      COUNT(package),
      package
    FROM reviews
      GROUP BY package
      ORDER BY COUNT(package) DESC, package DESC
  `) as Review[];

	return ok(packages);
};
