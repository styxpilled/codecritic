import { browser } from '$app/environment';
import { fetchOr } from '$lib';
import type { Package, User } from '$lib/types';
import Dexie, { type Table } from 'dexie';

export class CodeCriticDexie extends Dexie {
	users!: Table<User>;
	packages!: Table<Package>;

	constructor() {
		super('codecritic-db');
		this.version(1).stores({
			users: 'id, username, nickname',
			packages: 'name'
		});
	}
}

export const db = new CodeCriticDexie();

export const fetchUser = async (id: string) => {
	let user;
	if (browser) {
		user = await db.users.get(id);
		if (user !== undefined) {
			return user;
		}
	}
	user = await fetchOr<User | undefined>(`/api/users/id/${id}`, undefined);
	return user;
};
