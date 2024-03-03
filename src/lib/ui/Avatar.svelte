<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let username: string | undefined;
</script>

<div class="avatar {size}">
	{#if username}
		<img
			src="https://github.com/{username}.png?size={size === 'sm' ? 32 : size === 'md' ? 64 : 128}"
			alt="avatar"
		/>
	{/if}
</div>

<style>
	.avatar {
		display: inline-block;
		height: 1.75rem;
		width: 1.75rem;
		background-color: whitesmoke;
		border-radius: 1.25rem;
	}

	img {
		border-radius: 1.25rem;
	}

	.sm {
		height: 1rem;
		width: 1rem;
	}

	.md {
		height: 2rem;
		width: 2rem;
	}

	.lg {
		height: 2.5rem;
		width: 2.5rem;
	}
</style>
