import { DATABASE_URL } from '$env/static/private';
import type { NPMPackage, Package } from '$lib/types';
// import postgres from 'postgres';
import { neon } from '@neondatabase/serverless';

// export const sql = () => postgres(DATABASE_URL);
export const sql = neon(DATABASE_URL);
// export const $s = postgres(DATABASE_URL);

export const getRepoURL = (url?: string) => {
	return url
		? 'https://github.com' + url.substring(url.indexOf('github.com') + 10, url.length - 4)
		: undefined;
};

export const addPackage = async (npmPackage: NPMPackage, repository?: string) => {
	return (await sql`
    INSERT INTO packages
      (name, description, keywords, latest, next, license, repository, homepage, author, public)
    VALUES
      (
      ${npmPackage.name},
      ${npmPackage.description},
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
  `) as Package[];
};
