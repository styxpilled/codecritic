import { DATABASE_URL } from '$env/static/private';
// import postgres from 'postgres';
import { neon } from '@neondatabase/serverless';

// export const sql = () => postgres(DATABASE_URL);
export const sql = neon(DATABASE_URL);
// export const $s = postgres(DATABASE_URL);
