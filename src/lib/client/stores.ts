import type { User } from '$db/schema';
import { writable } from 'svelte/store';

export const user = writable<User | null>();
