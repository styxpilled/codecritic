import type { User } from '$lib/server/db/schema';

export const app = $state<{ user: User | null }>({
	user: null,
});
