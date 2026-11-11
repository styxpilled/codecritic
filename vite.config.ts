import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import pkg from 'git-describe';
import { registerHooks } from 'node:module';
import { dirname, relative, resolve, sep } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import lucide_sprite_plugin from 'vite-plugin-lucide-sprite';

const { gitDescribeSync } = pkg;

/**
 * `*.wasm?module` imports a `WebAssembly.Module`. Builds keep the import, so
 * that wrangler compiles the module. Dev compiles it in Node.
 */
function wasmModule(): Plugin {
	const PREFIX = '\0wasm-module:';
	const EXTERNAL = /(["'])wasm-file:(.+?)\1/g;
	let build = false;
	return {
		name: 'wasm-module',
		enforce: 'pre',
		configResolved(config) {
			build = config.command === 'build';
		},
		resolveId(source, importer) {
			if (source.startsWith('wasm-file:'))
				return { id: source, external: true };
			if (!source.endsWith('.wasm?module') || !importer) return;
			const file = resolve(
				dirname(importer),
				source.slice(0, -'?module'.length)
			);
			return PREFIX + file;
		},
		load(id) {
			if (!id.startsWith(PREFIX)) return;
			const file = JSON.stringify(id.slice(PREFIX.length));
			return build
				? `export { default } from ${JSON.stringify(`wasm-file:${id.slice(PREFIX.length)}`)};`
				: `import { readFileSync } from 'node:fs';\nexport default new WebAssembly.Module(readFileSync(${file}));`;
		},
		renderChunk(code, chunk, options) {
			if (!code.includes('wasm-file:') || !options.dir) return;
			const from = dirname(resolve(options.dir, chunk.fileName));
			return code.replace(EXTERNAL, (_, quote: string, file: string) => {
				const path = relative(from, file).split(sep).join('/');
				return quote + (path.startsWith('.') ? path : `./${path}`) + quote;
			});
		},
	};
}

/**
 * `vite preview` runs the built server in Node, which cannot load `.wasm`
 * modules or `cloudflare:workers`. adapter-cloudflare 8.0.2 stubs the latter
 * for preview, but `adapt` writes it back into the server output.
 */
function previewInNode(): Plugin {
	return {
		name: 'preview-in-node',
		configurePreviewServer() {
			const workers = new URL(
				'./src/virtual-cloudflare-workers.js',
				import.meta.resolve('@sveltejs/adapter-cloudflare')
			).href;
			registerHooks({
				resolve: (specifier, context, next) =>
					specifier === 'cloudflare:workers'
						? { url: workers, shortCircuit: true }
						: next(specifier, context),
				load: (url, context, next) =>
					url.endsWith('.wasm')
						? {
								format: 'module',
								shortCircuit: true,
								source: `import { readFileSync } from 'node:fs';\nexport default new WebAssembly.Module(readFileSync(new URL(${JSON.stringify(url)})));`,
							}
						: next(url, context),
			});
		},
	};
}

export default defineConfig({
	// Per worktree: `node_modules` is shared between worktrees.
	cacheDir: '.vite',
	plugins: [
		wasmModule(),
		previewInNode(),
		sveltekit({
			compilerOptions: {
				// defaults to rune mode for the project, execept for `node_modules`. Can be removed in svelte 6.
				runes: ({ filename }) => {
					const relativePath = relative(import.meta.dirname, filename);
					const pathSegments = relativePath.toLowerCase().split(sep);
					const isExternalLibrary = pathSegments.includes('node_modules');

					return isExternalLibrary ? undefined : true;
				},
				experimental: { async: true },
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter(),
			version: { name: gitDescribeSync().hash },
			experimental: { remoteFunctions: true },
		}),
		lucide_sprite_plugin({ icon_component_path: 'src/lib/ui/Icon.svelte' }),
	],
});
