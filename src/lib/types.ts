export type User = {
	username: string;
};

export type Package = {
	// public: boolean,
	name: string;
	description: string;
	tags: string[];
	version: string;
	// license: string,
	// repository: string,
	// homepage: string,
	author: string; // User
};

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
