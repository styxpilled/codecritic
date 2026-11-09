import { githubRepo } from '#lib';
import { initSync, render } from '../../../wasm/pkg/readme.js';

let ready: Promise<void> | undefined;

/** Renders README markdown to sanitized, highlighted HTML. See `wasm/`. */
export async function renderReadme(value: string, url: string | null) {
	if (!value) return '';
	// Imported on first use, so that build analysis in Node skips the wasm.
	ready ??= import('../../../wasm/pkg/readme_bg.wasm?module').then(
		({ default: module }) => void initSync({ module })
	);
	await ready;
	return render(value, githubRepo(url) ?? undefined);
}
