<script lang="ts">
	interface Props {
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		username: string | undefined;
	}

	let { size = 'md', username }: Props = $props();

	// svelte-ignore state_referenced_locally
	let pxSize = {
		xs: 32,
		sm: 32,
		md: 64,
		lg: 128,
		xl: 256
	}[size];
</script>

<div class="avatar {size}">
	{#if username}
		<img
			draggable="false"
			class={size}
			height={pxSize}
			width={pxSize}
			src="https://github.com/{username}.png?size={pxSize}"
			alt="avatar"
		/>
	{/if}
</div>

<style>
	:global(a:focus-visible:has(div.avatar)) {
		outline: none;
	}

	:global(a:focus-visible) div.avatar {
		outline: 2px solid var(--color-blue);
		outline-offset: 2px;
	}

	.avatar {
		display: inline-block;
		height: 1.75rem;
		width: 1.75rem;
		background-color: whitesmoke;
		border-radius: 999px;
		transition: outline-offset 250ms ease-in-out;
		outline-offset: 0px;
	}

	img {
		user-select: none;
		border-radius: 999px;
		border: 1px solid #383d45bb;
	}

	.xs {
		height: 1.5rem;
		width: 1.5rem;
	}

	.sm {
		height: 2rem;
		width: 2rem;
	}

	.md {
		height: 3rem;
		width: 3rem;
	}

	.lg {
		height: 4rem;
		width: 4rem;
	}

	.xl {
		height: 8rem;
		width: 8rem;
	}
</style>
