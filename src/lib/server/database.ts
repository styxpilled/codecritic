import { DATABASE_URL } from '$env/static/private';
import postgres from 'postgres';

export const sql = postgres(DATABASE_URL);
