import 'unplugin-icons/types/svelte';
import '../auto-imports.d.ts';
import { User, Session } from '$db/schema';
import type postgres from 'postgres';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
			sql: ReturnType<postgres>;
		}
	}
	// interface PageData {}
	// interface PageState {}
	// interface Platform {}
}

export {};
