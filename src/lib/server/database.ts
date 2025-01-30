import { STACK_SALT, REVIEW_SALT } from '$env/static/private';
import { examplePackage, type NPMPackage, type NPMSearchPackage, type Package } from '$lib/types';
import type postgres from 'postgres';
// import postgres from 'postgres';
// import type { ReservedSql } from 'postgres';
// export const sql = () => postgres(DATABASE_URL);
// export const locals.sql = neon(DATABASE_URL);
// export const $s = postgres(DATABASE_URL);

export const stackSalt = STACK_SALT;
export const reviewSalt = REVIEW_SALT;

export const getRepoURL = (url?: string) => {
	return url
		? 'https://github.com' + url.substring(url.indexOf('github.com') + 10, url.length - 4)
		: '';
};

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
		author: pkg.publisher?.username || pkg?.maintainers?.[0].username || '',
		public: true
	};
};

export const addPackages = async (sql: ReturnType<typeof postgres>, pkgs: Package[]) => {
	return sql`
    INSERT INTO packages
      ${sql(pkgs, examplePackage)}
    ON CONFLICT (name) DO NOTHING
  `;
	// return sql`
	//   INSERT INTO packages
	//     ${sql(pkgs, examplePackage)}
	//   ON CONFLICT (name) DO UPDATE
	//   SET ${Object.keys(pkgs[0]).map(
	// 		(x, i) => sql`${i ? sql`,` : sql``}${sql(x)} = excluded.${sql(x)}`
	// 	)}
	// `;
};
