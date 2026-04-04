import type { NPMSearchPackage } from '$lib/types';

export const npmToDB = (pkg: NPMSearchPackage) => {
	return {
		name: pkg.name,
		description: pkg.description || '',
		keywords: pkg.keywords || [],
		latest: pkg.version || '0.0.1',
		next: '',
		license: pkg.license || '',
		repository: pkg?.links?.repository || pkg?.repository?.url || '',
		homepage: pkg?.links?.homepage || '',
		author: pkg.publisher?.username || pkg?.maintainers?.[0].username || ''
	};
};
