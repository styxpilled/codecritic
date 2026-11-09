<script lang="ts">
	interface Props {
		rating: number;
	}

	let { rating }: Props = $props();
</script>

<span class="fg-blue">
	{#each { length: Math.floor(rating / 2) }, i (i)}
		★
	{/each}{#if rating % 2 === 1}
		½
	{/if}
</span>

<style>
	span {
		letter-spacing: -0.1em;
	}

	/* .char {
		font-size: 1rem;
	} */
</style>
