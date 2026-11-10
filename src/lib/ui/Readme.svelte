<script lang="ts">
	import { mount, unmount } from 'svelte';
	import '#styles/github.css';
	import '#styles/readme.css';
	import CopyButton from './CopyButton.svelte';
	import Icon from './Icon.svelte';

	interface Props {
		html: string;
	}

	let { html }: Props = $props();

	let readme = $state<HTMLDivElement>();

	// Mounted after hydration, so SSR output and {@html} stay untouched.
	$effect(() => {
		if (!readme || !html) return;
		const buttons = Array.from(readme.querySelectorAll('pre'), (pre) =>
			mount(CopyButton, { target: pre, props: { pre } })
		);
		return () => buttons.forEach((button) => unmount(button));
	});
</script>

{#if html}
	<div class="readme" bind:this={readme}>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</div>
	<label class="hide-readme hov-link fg-blue pointer mobile">
		<Icon size="1.25em" id="x" class="closed" style="color: transparent;" />
		<span class="closed">...more</span>
		<Icon size="1.25em" id="x" class="open" />
		<span class="open">Show less</span>
		<input type="checkbox" name="readme-checkbox" />
	</label>
{/if}
