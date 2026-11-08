import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import pkg from 'git-describe';
import { relative, sep } from 'node:path';
import { defineConfig } from 'vite';
import lucide_sprite_plugin from 'vite-plugin-lucide-sprite';

const { gitDescribeSync } = pkg;

export default defineConfig({
	plugins: [
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
