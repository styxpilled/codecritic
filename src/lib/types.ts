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

export type NPMSearchPackage = {
	name: string;
	scope?: string;
	version: string;
	description?: string;
	keywords?: string[];
	date: string;
	links: {
		npm: string;
		homepage?: string;
		repository?: string;
		bugs?: string;
	};
	author?: { name: string };
	publisher?: { username: string; email: string };
	maintainers?: { username: string; email: string }[];
};

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export function isReviewPackage(pkg: Package | ReviewedPackage): pkg is ReviewedPackage {
	// @ts-expect-error ts is stupid idk why
	return pkg?.review !== undefined;
}

export type ReviewedPackage = Package & { review: Review };
