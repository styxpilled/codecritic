import type { User } from '#lib/server/db/schema.ts';

export const app = $state<{ user: User | null }>({
	user: null,
});
