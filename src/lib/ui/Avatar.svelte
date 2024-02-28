<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' = 'md';
</script>

<div class="avatar {size}" />

<style>
	.avatar {
		display: inline-block;
		height: 1.75rem;
		width: 1.75rem;
		background-color: lightseagreen;
		border-radius: 1rem;
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
