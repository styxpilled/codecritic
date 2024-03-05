export type User = {
	id: string;
	githubId: number;
	username: string;
	nickname: string;
};

export type DBUser = {
	id: string;
	github_id: number;
	username: string;
	nickname: string;
};

export type Review = {
	id: string;
	author: User;
	package: string;
	review: string;
	rating: number;
	version: string;
	created_at: string;
	likes: number;
	liked: boolean;
};

type _PackageInternal = {
	name: string;
	description: string;
	keywords?: string[];
	version: string;
	license?: string;
	homepage?: string;
	public: boolean;
};

export type Package = Expand<
	_PackageInternal & {
		latest: string;
		next?: string;
		repository?: string;
		author?: string;
	}
>;

export type NPMPackage = Expand<
	_PackageInternal & {
		'dist-tags': {
			latest: string;
			next?: string;
		};
		repository?: {
			url: string;
		};
		author?: {
			name: string;
		};
	}
>;

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export function isReviewPackage(pkg: Package | ReviewedPackage): pkg is ReviewedPackage {
	// @ts-expect-error ts is stupid idk why
	return pkg?.review !== undefined;
}

export type ReviewedPackage = Package & { review: Review };

export const examplePackage: Package = {
	name: 'svelte',
	description: 'Cybernetically enhanced web apps',
	tags: ['UI', 'framework', 'templates', 'templating'],
	version: '4.2.12',
	author: 'svelte-admin'
};

export const examples: ReviewedPackage[] = [
	{
		name: 'svelte',
		description: 'Cybernetically enhanced web apps',
		tags: ['UI', 'framework', 'templates', 'templating'],
		version: '4.2.12',
		author: 'svelte-admin',
		review: {
			author: 'styxpilled',
			rating: 9
		}
	},
	{
		name: 'lucia',
		description: 'A simple and flexible authentication library',
		tags: ['lucia', 'lucia-auth', 'authentication', 'auth'],
		version: '3.0.1',
		author: 'pilcrowonpaper',
		review: {
			author: 'styxpilled',
			rating: 8
		}
	},
	{
		name: 'react',
		description: 'React is a JavaScript library for building user interfaces.',
		tags: ['react'],
		version: '18.0.2',
		author: 'gnoff',
		review: {
			author: 'styxpilled',
			rating: 2
		}
	}
];
