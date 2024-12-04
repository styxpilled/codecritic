<script lang="ts">
	interface Props {
		rating: number;
	}

	let { rating }: Props = $props();
</script>

<span class="fg-blue">
	{#each { length: Math.floor(rating / 2) } as _, i}
		<span class="char">★</span>
	{/each}
	{#if rating % 2 === 1}
		<span class="char">½</span>
	{/if}
</span>

<style>
	span {
		font-size: 0;
	}

	.char {
		font-size: 1rem;
	}
</style>
