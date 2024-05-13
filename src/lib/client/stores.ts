import type { User } from 'lucia';
import { writable } from 'svelte/store';

export const user = writable<User | null>();
export const pageSize = writable('950px');
