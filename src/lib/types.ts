export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type NPMSearchPackage = {
	name: string;
	scope?: string;
	version: string;
	description?: string;
	keywords?: string[];
	date: string;
	repository?: {
		url: string;
	};
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
