export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

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
