import type { NPMSearchPackage } from '$lib/types';

export const npmToDB = (pkg: NPMSearchPackage) => {
	return {
		name: pkg.name,
		description: pkg.description || '',
		keywords: pkg.keywords || [],
		latest: pkg['dist-tags']?.latest,
		next: pkg['dist-tags']?.next,
		license: pkg.license || '',
		repository: pkg?.repository?.url || '',
		homepage: pkg?.homepage,
		modified: pkg?.time?.modified
	};
};
