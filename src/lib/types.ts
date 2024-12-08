import type { Package as _PackageInteral } from '$db/schema';

export type User = {
	id: number;
	githubId: number;
	username: string;
	nickname: string;
	following?: string;
	followers?: string;
};

export type DBUser = {
	id: string;
	github_id: number;
	username: string;
	nickname: string;
};

export type Profile = {
	id: string;
	bio?: string;
	url?: string;
	links?: string[];
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

type __PackageInternal = {
	name: string;
	description: string;
	keywords?: string[];
	license?: string;
	homepage?: string;
	public: boolean;
};

export type Package = _PackageInteral;
export const examplePackage = Object.keys({
	name: '',
	description: '',
	keywords: [],
	latest: '',
	next: '',
	license: '',
	repository: '',
	homepage: '',
	author: '',
	public: true
}) as (keyof Package)[];

export type NPMPackage = Expand<
	__PackageInternal & {
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
	repository?: {
		url: string;
	};
	author?: { name: string };
	publisher?: { username: string; email: string };
	maintainers?: { username: string; email: string }[];
	license?: string;
};

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export function isReviewPackage(pkg: Package | ReviewedPackage): pkg is ReviewedPackage {
	// @ts-expect-error ts is stupid idk why
	return pkg?.review !== undefined;
}

export type ReviewedPackage = Package & { review: Review };

export type Stack = {
	id: number;
	author: string | User;
	name: string;
	created_at: Date;
	updated_at: Date;
	description: string;
};
