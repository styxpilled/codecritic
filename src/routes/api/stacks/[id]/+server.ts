import { notFound, ok } from '$lib/server';
import { stackSalt } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const [stack] = await locals.sql`
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

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const body = await request.json();

	locals.sql.transaction([
		locals.sql`
      UPDATE stacks
        SET name = ${body.name},
            description = ${body.description},
            updated_at = ${new Date().toLocaleString('en-US')}
        WHERE stacks.id = extensions.id_decode_once(${params.id}, ${stackSalt}, 4)
    `,
		locals.sql`
      DELETE FROM stacks_packages
        WHERE stack_id = extensions.id_decode_once(${params.id}, ${stackSalt}, 4)
    `,
		locals.sql`
      INSERT INTO stacks_packages
    `
	]);

	return ok();
};
