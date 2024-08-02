import 'unplugin-icons/types/svelte';
import '../auto-imports.d.ts';
import postgres from 'postgres';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
			sql: ReturnType<postgres>;
			lucia: import('lucia').Lucia;
		}
	}
	// interface PageData {}
	// interface PageState {}
	// interface Platform {}
}

export {};
