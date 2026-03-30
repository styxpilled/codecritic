/// <reference types="./worker-configuration" />

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			// user?: User;
			// session?: Session;
			db: import('./lib/server/db/index').DrizzleClient;
		}
		interface Platform {
			// env: {
			// 	DB: D1Database;
			// };
			env: Cloudflare.Env;
			context: IncomingRequestCfProperties;
			cf: CfProperties;
			caches: CacheStorage & { default: Cache };
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
