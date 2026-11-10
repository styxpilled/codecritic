<script lang="ts">
	import Icon from './Icon.svelte';

	let { pre }: { pre: HTMLPreElement } = $props();

	let copied = $state(false);
	let timeout: ReturnType<typeof setTimeout>;

	async function copy() {
		const text = (pre.querySelector('code') ?? pre).textContent ?? '';
		await navigator.clipboard.writeText(text);
		copied = true;
		clearTimeout(timeout);
		timeout = setTimeout(() => (copied = false), 1500);
	}
</script>

<button class="copy-code hov-light" aria-label="Copy code" onclick={copy}>
	<Icon size="1.25em" id={copied ? 'check' : 'copy'} />
</button>
