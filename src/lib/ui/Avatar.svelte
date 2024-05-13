<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let username: string | undefined;

	let pxSize = 32;

	switch (size) {
		case 'sm':
			pxSize = 32;
			break;
		case 'md':
			pxSize = 64;
			break;
		case 'lg':
			pxSize = 128;
			break;
		case 'xl':
			pxSize = 256;
			break;
		default:
			break;
	}
</script>

<div class="avatar {size}">
	{#if username}
		<img draggable="false" src="https://github.com/{username}.png?size={pxSize}" alt="avatar" />
	{/if}
</div>

<style>
	.avatar {
		display: inline-block;
		height: 1.75rem;
		width: 1.75rem;
		background-color: whitesmoke;
		border-radius: 999px;
		/* outline: #383d45bb solid 2px; */
	}

	img {
		user-select: none;
		border-radius: 999px;
		border: 1px solid #383d45bb;
	}

	.xs {
		height: 1rem;
		width: 1rem;
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
		height: 8rem;
		width: 8rem;
	}

	.xl {
		height: 16rem;
		width: 16rem;
	}
</style>
