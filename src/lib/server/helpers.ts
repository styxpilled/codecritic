import type { NPMDirectPackage } from '#lib/types.ts';
import type { Package } from './db/schema';

export const npmToDB = (pkg: NPMDirectPackage): Package => {
	return {
		name: pkg.name,
		description: pkg.description || '',
		keywords: pkg.keywords || [],
		latest: pkg?.['dist-tags']?.latest || pkg.version,
		next: pkg?.['dist-tags']?.next,
		license: pkg.license || '',
		repository: pkg?.repository?.url || '',
		homepage: pkg?.homepage || null,
		modified: pkg?.time?.modified,
	};
};
