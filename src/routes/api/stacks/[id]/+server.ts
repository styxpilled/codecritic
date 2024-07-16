import { notFound, ok } from '$lib/server';
import { stackSalt, sql } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const [stack] = await sql`
    SELECT 
      stacks.*,
      extensions.id_encode(id, ${stackSalt}, 4) id,
      JSON_AGG(packages) packages
    FROM stacks
      LEFT JOIN stacks_packages
 		    ON stacks.id = stacks_packages.stack_id
	    LEFT JOIN packages
		    ON packages.name = stacks_packages.package
    WHERE stacks.id = extensions.id_decode_once(${params.id}, ${stackSalt}, 4)
    GROUP BY stacks.id
  `;
	if (!stack) throw notFound();
	if (stack.packages[0] === null) {
		stack.packages = [];
	}
	return ok(stack);
};
