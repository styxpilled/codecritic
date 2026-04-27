import type { NPMSearchPackage } from '$lib/types';
import type { Package } from './db/schema';

export const npmToDB = (pkg: NPMSearchPackage): Package => {
	return {
		name: pkg.name,
		description: pkg.description || '',
		keywords: pkg.keywords || [],
		latest: pkg['dist-tags']?.latest,
		next: pkg['dist-tags']?.next,
		license: pkg.license || '',
		repository: pkg?.repository?.url || '',
		homepage: pkg?.homepage || null,
		modified: pkg?.time?.modified,
	};
};
