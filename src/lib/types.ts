export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

import type { User } from '$lib/server/db/schema';

/** A user with their follow state relative to the viewer. */
export type FollowUser = User & {
	userFollows: boolean;
	followsUser: boolean;
	followers?: number;
};

/** What the user cards draw. `userCounts` in `user.remote.ts` fills it. */
export type UserCard = FollowUser & {
	reviews: number;
	stacks: number;
	likesGiven: number;
	favorites: string[];
};

export type NPMDirectPackage = {
	name: string;
	scope?: string;
	version: string;
	description?: string;
	keywords?: string[];
	date: string;
	repository?: {
		url: string;
	};
	readme: string;
	homepage?: string;
	time: {
		created: string;
		modified: string;
	};
	'dist-tags': {
		next: string;
		latest: string;
	};
	author?: { name: string };
	publisher?: { username: string; email: string };
	maintainers?: { username: string; email: string }[];
	license?: string;
};

export type NPMSearchResult = {
	objects: {
		package: {
			name: string;
			keywords: string[];
			version: string;
			description: string;
			sanitized_name: string;
			publisher?: { username: string; email: string };
			maintainers?: { username: string; email: string }[];
			license: string;
			date: string;
			links: {
				homepage?: string;
				repository?: string;
				bugs?: string;
				npm: string;
			};
		};
		searchScore: number;
		score: {
			final: number;
		};
		updated: string;
		downloads: {
			monthly: number;
			weekly: number;
		};
	}[];
};
