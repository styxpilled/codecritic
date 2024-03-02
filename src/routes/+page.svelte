<script lang="ts">
	import { examples } from '$lib/types';
	import List from '$ui/List.svelte';

	export let data;
</script>

<div class="greeting">
	{#if data.auth.user}
		<h1>Welcome back, {data.auth.user.nickname || data.auth.user.username}!</h1>
	{:else}
		<h1>Welcome to codecritic!</h1>
	{/if}
	<p>Here's what your friends have been {data.greetMessage}:</p>
	<!-- <Swear /> -->
	<List packages={examples}>
		<span>New from friends</span>
		<span>All activity</span>
	</List>
	<List
		packages={structuredClone(examples).map((pkg) => {
			pkg.review = undefined;
			return pkg;
		})}
	>
		<span>Recommended</span>
		<span>All recommened</span>
	</List>
</div>

<style>
	.greeting {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}
</style>
