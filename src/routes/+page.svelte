<script lang="ts">
	import { examplePackage, examples } from '$lib/types.ts';
	import List from '$ui/List.svelte';
	import Swear from '$ui/Swear.svelte';

	export let data;
</script>

<div class="greeting">
	<h1>Welcome back, beautiful!</h1>
	<p>Here's what your friends have been {data.greetMessage}:</p>
	<Swear />
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
