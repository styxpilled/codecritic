import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import lucide_sprite_plugin from 'vite-plugin-lucide-sprite';
export default defineConfig({
	plugins: [sveltekit(), lucide_sprite_plugin({ icon_component_path: 'src/lib/ui/Icon.svelte' })]
});
