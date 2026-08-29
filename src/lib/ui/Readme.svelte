<script lang="ts">
	import '$styles/github.css';
	import '$styles/readme.css';
	import Icon from './Icon.svelte';

	interface Props {
		html: string;
	}

	let { html }: Props = $props();
</script>

{#if html}
	<div class="readme">
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
