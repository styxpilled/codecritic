import 'unplugin-icons/types/svelte';
import '../auto-imports.d.ts';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
		}
	}
	// interface PageData {}
	// interface PageState {}
	// interface Platform {}
}

export {};
