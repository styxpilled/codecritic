import { STACK_SALT, REVIEW_SALT } from '$env/static/private';
import { examplePackage, type NPMPackage, type Package } from '$lib/types';
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
		: undefined;
};

export const addPackage = async (
	sql: ReturnType<typeof postgres>,
	npmPackage: NPMPackage,
	repository?: string
): Promise<Package[]> => {
	return sql`
    INSERT INTO packages
      (name, description, keywords, latest, next, license, repository, homepage, author, public)
    VALUES
      (
      ${npmPackage.name},
      ${npmPackage?.description || ''},
      ${npmPackage?.keywords},
      ${npmPackage['dist-tags']?.latest},
      ${npmPackage['dist-tags']?.next},
      ${npmPackage?.license},
      ${repository},
      ${npmPackage?.homepage},
      ${npmPackage?.author?.name},
      ${npmPackage?.public}
      )
    ON CONFLICT DO NOTHING
    RETURNING *
  `;
};

export const addPackages = async (sql: ReturnType<typeof postgres>, pkgs: Package[]) => {
	return sql`
    INSERT INTO packages
      ${sql(pkgs, examplePackage)}
    ON CONFLICT DO NOTHING
  `;
};
