import type { NPMDirectPackage } from '#lib/types.ts';
import type { Package } from './db/schema';

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** npm metadata is not validated; old packages use other shapes. */
export const npmToDB = (pkg: NPMDirectPackage): Package => {
	const { license, repository, keywords } = pkg as Record<string, unknown>;
	return {
		name: pkg.name,
		description: str(pkg.description),
		keywords: [
			...new Set(
				(Array.isArray(keywords) ? keywords : str(keywords).split(','))
					.map((k) => str(k).trim())
					.filter(Boolean)
			),
		],
		latest: pkg?.['dist-tags']?.latest || pkg.version,
		next: pkg?.['dist-tags']?.next,
		license: str(license) || str((license as { type?: unknown })?.type),
		repository: str(repository) || str((repository as { url?: unknown })?.url),
		homepage: str(pkg.homepage) || null,
		modified: pkg?.time?.modified,
	};
};
